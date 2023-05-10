import {Address, Collection, ContractType, Network, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import {
    getCollectionId,
    getNftId,
    getTransferId,
    handleAddress,
    handleNetwork,
    incrementBigInt
} from "../../utils/common";
import {BigNumber} from "ethers";
import {TransferBatchLog} from "../../types/abi-interfaces/Erc1155";

export async function handleERC1155batch(event: TransferBatchLog): Promise<void> {

    let instance = Erc1155__factory.connect(event.address, api);

    let totalSupply = BigInt(0)
    let isERC1155 = false
    let isERC1155Metadata = false

    // refactor this
    try {
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155} batchTransfer`)
        logger.info(`address: ${event.address}`)
        logger.info(`tx: ${event.transactionHash}`)

    } catch (e) {
        return;
    }

    try {
        isERC1155Metadata = await instance.supportsInterface('0x0e89341c')
    } catch {
        isERC1155Metadata = false
    }

    let network = await handleNetwork("1", "ethereum")
    await handleAddress(event.address, network.id)

    const collectionId = getCollectionId(network.id, event.address)
    let collection = await Collection.get(collectionId)
    // logger.info(collection)

    if (!collection) {
        logger.info('creating new collection')
        collection = Collection.create({
            id: collectionId,
            networkId: network.id,
            contract_address: event.address,
            created_block: BigInt(event.blockNumber),
            created_timestamp: event.block.timestamp,
            minter_addressId: event.transaction.from,
            total_supply: totalSupply,
            name: "TODO metadata",
            symbol: "TODO metadata"
        })
        await collection.save().then(()=>{
            logger.info('collection saved')
        })
    }

    const tokenIds = event.args.ids

    let nfts = await Promise.all(tokenIds.map(
        async (tokenId, idx) => {
            const nftId = getNftId(collectionId, tokenId.toString())
            let metadataUri = null
            let ntf = await Nft.get(nftId)

            if (isERC1155Metadata) {
                try {
                    metadataUri = await instance.uri(tokenId)
                } catch {
                    logger.warn(`Contract uri instance broken at address ${event.address}`)
                }
            }

            // using third arg, conflicts between object and array
            const _amount = event.args[3][idx]
            logger.info(`amount: ${_amount}`)

            if (!ntf) {
                ntf = Nft.create({
                    id: nftId,
                    tokenId: tokenId.toString(),
                    amount: _amount.toBigInt(),
                    collectionId,
                    minted_block: BigInt(event.blockNumber),
                    minted_timestamp: event.block.timestamp,
                    minter_addressId: event.address,
                    current_ownerId: event.args.to,
                    contract_type: ContractType.ERC1155,
                    metadata_uri: metadataUri,
                })

                logger.info(`collections: ${collection}`)
                logger.info(`batch totalSupplu ${collection.total_supply}`)
                collection.total_supply = incrementBigInt(collection.total_supply)
                logger.info(`new totalSupply ${collection.total_supply}`)

                await Promise.all([
                    collection.save(),
                    ntf.save()
                ]).then(()=> {
                    logger.info("updated collections")
                    logger.info("saved new NFT")
                })
            }
            return ntf
        }
    ))

    const transferId = getTransferId(event.transactionHash, event.transactionIndex)
    let transfer = await Transfers.get(transferId)

    if (!transfer) {
        let transfers = tokenIds.map( (tokenId, idx) => {
            return Transfers.create({
                id: transferId,
                tokenId: tokenId.toString(),
                amount: event.args[3][idx].toBigInt(), // object/array conflicts
                networkId: network.id,
                block: BigInt(event.blockNumber),
                timestamp: event.block.timestamp,
                transaction_id: event.transactionHash,
                nftId: nfts[idx].id,
                fromId: event.args.from,
                toId: event.args.to
            })
        })
        await Promise.all(transfers.map(async (transfer)=> await transfer.save() ))
    }
}