import { Collection, ContractType, Nft, Transfers } from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import { getCollectionId, getNftId, getTransferId, incrementBigInt } from "../../utils/common";
import {TransferSingleLog} from "../../types/abi-interfaces/Erc1155";
import {handleNetwork} from "../../utils/utilHandlers";
import assert from "assert";

export async function handleERC1155Single(
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
    } catch (e) {
        return;
    }

    assert(event.args, 'No event args on erc1155')

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155Metadata = await instance.supportsInterface('0x0e89341c')
    } catch {
    }

    const network = await handleNetwork(chainId)

    const collectionId = getCollectionId(network.id, event.address)
    let collection = await Collection.get(collectionId)

    if (!collection) {
        collection = Collection.create({
            id: collectionId,
            networkId: network.id,
            contract_address: event.address,
            created_block: BigInt(event.blockNumber),
            created_timestamp: event.block.timestamp,
            creator_address: event.transaction.from,
            total_supply: totalSupply,
            name: undefined, // erc1155 does not have name and symbol
            symbol: undefined // ^
        })
        await collection.save()
    }

    const tokenId = event.args.id.toString()
    const nftId = getNftId(collection.id, tokenId)
    let nft = await Nft.get(nftId)

    if (!nft) {
        let metadataUri

        if (isERC1155Metadata) {
            try {
                metadataUri = await instance.uri(tokenId)
            } catch {
                logger.warn(`Contract uri instance broken at address ${event.address}`)
                metadataUri = undefined
            }
        }
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
            metadata_status: "PENDING"
        })

        collection.total_supply = incrementBigInt(collection.total_supply)

        await Promise.all([
            collection.save(),
            nft.save()
        ])
    }

    const transferId = getTransferId(network.id ,event.transactionHash)
    const transfer = Transfers.create({
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