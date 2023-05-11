import {Address, Collection, ContractType, Network, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import {getAddressId, getCollectionId, getNftId, getTransferId, incrementBigInt} from "../../utils/common";
import {BigNumber} from "ethers";
import {TransferSingleLog} from "../../types/abi-interfaces/Erc1155";
import {handleAddress, handleCollection, handleNetwork} from "../../utils/utilHandlers";
import {enumNetwork} from "../../utils/network-enum";
import assert from "assert";

export async function handleERC1155single(
    event: TransferSingleLog,
    _network: enumNetwork
): Promise<void> {
    assert(event.args, 'No event args')

    let instance = Erc1155__factory.connect(event.address, api);

    let totalSupply = BigInt(0)
    let isERC1155 = false
    let isERC1155Metadata = false

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155}`)
        logger.info(`address: ${event.address}`)
        logger.info(`tx: ${event.transactionHash}`)

    } catch (e) {
        return;
    }

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155Metadata = await instance.supportsInterface('0x0e89341c')
    } catch {
    }



    let network = await handleNetwork(_network.chainId, _network.name)
    await handleAddress(event.address, network.id)

    let collection = await handleCollection<TransferSingleLog>(
        network.id,
        event,
        totalSupply,
        undefined,
        undefined
    )

    const tokenId = event.args.id.toString()
    const nftId = getNftId(collection.id, tokenId)
    let nft = await Nft.get(nftId)

    if (!nft) {
        logger.info(`nft created at ${event.blockNumber}`)
        let metadataUri

        if (isERC1155Metadata) {
            try {
                metadataUri = await instance.uri(tokenId)
            } catch {
                logger.warn(`Contract uri instance broken at address ${event.address}`)
            }
        }

        nft = Nft.create({
            id: nftId,
            tokenId: tokenId,
            amount: event.args.value.toBigInt(),
            collectionId: collection.id,
            minted_block: BigInt(event.blockNumber),
            minted_timestamp: event.block.timestamp,
            minter_addressId: event.address,
            current_ownerId: event.args.to,
            contract_type: ContractType.ERC1155,
            metadata_uri: metadataUri,
        })

        collection.total_supply = incrementBigInt(collection.total_supply ?? BigInt(0))

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
            transaction_id: event.transactionHash,
            nftId: nft.id,
            fromId: event.args.from,
            toId: event.args.to
        })
        await transfer.save()
    }
}