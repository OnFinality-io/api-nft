import {ContractType, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import {
    getNftId,
    getTransferId,
    incrementBigInt
} from "../../utils/common";
import {TransferBatchLog} from "../../types/abi-interfaces/Erc1155";
import {handleAddress, handleCollection, handleNetwork} from "../../utils/utilHandlers";
import {enumNetwork} from "../../utils/network-enum";

export async function handleERC1155batch(
    event: TransferBatchLog,
    _network: enumNetwork
): Promise<void> {

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

    let network = await handleNetwork(_network.chainId, _network.name)

    await handleAddress(event.address, network.id)

    let collection = await handleCollection<TransferBatchLog>(
        network.id,
        event,
        totalSupply,
        null,
        null
    )

    const tokenIds = event.args.ids

    let nfts = await Promise.all(tokenIds.map(
        async (tokenId, idx) => {
            const nftId = getNftId(collection.id, tokenId.toString())
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

            if (!ntf) {
                ntf = Nft.create({
                    id: nftId,
                    tokenId: tokenId.toString(),
                    amount: _amount.toBigInt(),
                    collectionId: collection.id,
                    minted_block: BigInt(event.blockNumber),
                    minted_timestamp: event.block.timestamp,
                    minter_addressId: event.address,
                    current_ownerId: event.args.to,
                    contract_type: ContractType.ERC1155,
                    metadata_uri: metadataUri,
                })
                collection.total_supply = incrementBigInt(collection.total_supply)
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