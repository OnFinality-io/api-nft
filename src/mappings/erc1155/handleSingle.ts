import {Address, Collection, ContractType, Network, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import {getAddressId, getCollectionId, getNftId, getTransferId} from "../../utils/common";
import {BigNumber} from "ethers";
import {TransferSingleLog} from "../../types/abi-interfaces/Erc1155";

export async function handleERC1155single(event: TransferSingleLog): Promise<void> {

    let instance = Erc1155__factory.connect(event.address, api);

    let totalSupply = BigInt(0)
    let isERC1155 = false
    let isERC1155Metadata = false

    try {
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155}`)
        logger.info(`address: ${event.address}`)
        logger.info(`tx: ${event.transactionHash}`)

    } catch (e) {
        // logger.warn(`not erc1155`)
        return;
    }

    try {
        isERC1155Metadata = await instance.supportsInterface('0x0e89341c')
    } catch {
        // empty
    }

    // TODO Network can be refactored
    let network = await Network.get("1")

    if (!network) {
        network = new Network( "1")
        network.name = "ethereum"
        await network.save()
    }

    // TODO Address can be refactored
    // Address would be operator ?
    const addressId = getAddressId(network.id, event.address)
    let address = await Address.get(addressId)

    if (!address) {
        address = Address.create({
            id: addressId,
            address: event.address,
            networkId: network.id
        })
        await address.save()
    }

    const collectionId = getCollectionId(network.id, event.address)
    let collection = await Collection.get(collectionId)

    if (!collection) {


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
        await collection.save()
    }

    const tokenId = event.args.id.toString()
    const nftId = getNftId(collection.id, tokenId)
    let nft = await Nft.get(nftId)

    if (!nft) {
        logger.info(`nft created at ${event.blockNumber}`)

        const metadataUri = isERC1155Metadata
            ? (await instance.uri(event.args.id)) : "unavailable"

        nft = Nft.create({
            id: nftId,
            tokenId: tokenId,
            amount: BigInt(1),
            collectionId: collection.id,
            minted_block: BigInt(event.blockNumber),
            minted_timestamp: event.block.timestamp,
            minter_addressId: event.address,
            current_ownerId: event.args.to,
            contract_type: ContractType.ERC1155,
            metadata_uri: metadataUri,
        })

        // TODO total_supply, burn relation
        collection.total_supply = BigNumber.from(collection.total_supply).add(1).toBigInt()

        await Promise.all([
            collection.save(),
            nft.save()
        ]).then(()=> {
            logger.info("updated collections")
            logger.info("saved new NFT")
        })
    }

    const transferId = getTransferId(event.transactionHash, event.transactionIndex)
    let transfer = await Transfers.get(transferId)

    if (!transfer) {
        transfer = Transfers.create({
            id: transferId,
            tokenId,
            amount: event.args.value.toBigInt(),
            networkId: network.id,
            block: BigInt(event.blockNumber),
            timestamp: event.block.timestamp,
            transaction_id: event.transactionHash,
            nftId: nft.id,
            fromId: event.args.from,
            toId: event.args.to
        })
        await transfer.save()
    }
}