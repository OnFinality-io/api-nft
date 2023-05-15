import { ContractType, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import { getNftId, getTransferId, incrementBigInt} from "../../utils/common";
import {TransferSingleLog} from "../../types/abi-interfaces/Erc1155";
import {handleCollection, handleNetwork} from "../../utils/utilHandlers";
import assert from "assert";

export async function handleERC1155single(
    event: TransferSingleLog,
): Promise<void> {

    const instance = Erc1155__factory.connect(event.address, api);

    const totalSupply = BigInt(0)
    let isERC1155 = false
    let isERC1155Metadata = false

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155} singleTransfer`)
        logger.info(`address: ${event.address}`)
        logger.info(`tx: ${event.transactionHash}`)

    } catch (e) {
        logger.info(`not it`)
        return;
    }

    assert(event.args, 'No event args on erc1155')

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155Metadata = await instance.supportsInterface('0x0e89341c')
    } catch {
    }

    const network = await handleNetwork(chainId)

    const collection = await handleCollection<TransferSingleLog>(
        network.id,
        event,
        totalSupply,
    )

    const tokenId = event.args.id.toString()
    const nftId = getNftId(collection.id, tokenId)
    let nft = await Nft.get(nftId)
    logger.info('get nft')

    if (!nft) {
        logger.info(`nft created at ${event.blockNumber}`)
        let metadataUri

        if (isERC1155Metadata) {
            try {
                metadataUri = await instance.uri(tokenId)
            } catch {
                logger.warn(`Contract uri instance broken at address ${event.address}`)
                metadataUri = undefined
            }
        }

        logger.info('hi before create')

        nft = Nft.create({
            id: nftId,
            tokenId: tokenId,
            amount: event.args.value.toBigInt(),
            collectionId: collection.id,
            minted_block: BigInt(event.blockNumber),
            minted_timestamp: event.block.timestamp,
            minter_address: event.address,
            current_owner: event.args.to,
            contract_type: ContractType.ERC1155,
            metadata_uri: metadataUri,
        })

        collection.total_supply = incrementBigInt(collection.total_supply)

        logger.info(`collection: ${collection.total_supply}`)
        await Promise.all([
            collection.save(),
            nft.save()
        ])
    }

    const transferId = getTransferId(network.id ,event.transactionHash)
    let transfer = await Transfers.get(transferId)

    if (!transfer) {
        transfer = Transfers.create({
            id: transferId,
            tokenId,
            amount: event.args.value.toBigInt(),
            networkId: network.id,
            block: BigInt(event.blockNumber),
            timestamp: event.block.timestamp,
            transaction_hash: event.transactionHash,
            nftId: nft.id,
            from: event.args.from,
            to: event.args.to
        })
        await transfer.save()
    }
}