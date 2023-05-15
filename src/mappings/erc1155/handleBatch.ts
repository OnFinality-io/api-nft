import {ContractType, Nft, Transfers} from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import {
    getNftId,
    getTransferId,
    incrementBigInt
} from "../../utils/common";
import {TransferBatchLog} from "../../types/abi-interfaces/Erc1155";
import {handleCollection, handleNetwork} from "../../utils/utilHandlers";
import assert from "assert";

export async function handleERC1155batch(
    event: TransferBatchLog,
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
        isERC1155Metadata = false
    }

    const network = await handleNetwork(chainId)

    // name and symbol do not exist on erc1155
    const collection = await handleCollection<TransferBatchLog>(
       network.id,
        event,
        totalSupply
    )

    const tokenIds = event.args.ids

    const nfts = (await Promise.all(tokenIds.map(async (tokenId, idx) =>{
        assert(event.args, 'No event args')
        const nftId = getNftId(collection.id, tokenId.toString())
        let metadataUri
        const ntf = await Nft.get(nftId)

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
            collection.total_supply = incrementBigInt(collection.total_supply)

            return Nft.create({
                id: nftId,
                tokenId: tokenId.toString(),
                amount: _amount.toBigInt(),
                collectionId: collection.id,
                minted_block: BigInt(event.blockNumber),
                minted_timestamp: event.block.timestamp,
                minter_address: event.transaction.from,
                current_owner: event.args.to,
                contract_type: ContractType.ERC1155,
                metadata_uri: metadataUri,
            })
        }
        // return undefined
    }))).filter(Boolean) as Nft[]

    const transferId = getTransferId(network.id, event.transactionHash)

    const transfers = tokenIds.map( (tokenId, idx) => {
        assert(event.args, 'No event args')
        return Transfers.create({
            id: transferId,
            tokenId: tokenId.toString(),
            amount: event.args[3][idx].toBigInt(), // object/array conflicts
            networkId: network.id,
            block: BigInt(event.blockNumber),
            timestamp: event.block.timestamp,
            transaction_hash: event.transactionHash,
            nftId: getNftId(collection.id, tokenId.toString()),
            from: event.args.from,
            to: event.args.to
        })
    })

    await Promise.all([
        store.bulkUpdate('Nft', nfts) ,
        store.bulkUpdate('Transfer', transfers),
        collection.save()
    ])
}