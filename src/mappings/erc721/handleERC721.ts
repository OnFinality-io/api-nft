import { Collection, ContractType, Nft, Transfer } from '../../types';
import { Erc721__factory } from '../../types/contracts';
import {
    getCollectionId,
    getNftId,
    getTransferId,
    incrementBigInt,
} from '../../utils/common';
import assert from 'assert';
import {handleNetwork} from "../../utils/utilHandlers";
import {FrontierEthProvider, FrontierEvmEvent} from "@subql/frontier-evm-processor";
import {TransferEvent} from "../../types/contracts/Erc721";

export async function handleERC721(event: FrontierEvmEvent<TransferEvent['args']>): Promise<void> {
    logger.info('hit erc721')
    const network = await handleNetwork(chainId);

    const instance = Erc721__factory.connect(event.address,  new FrontierEthProvider());


    let totalSupply = BigInt(0);
    let isERC721 = false;

    let isERC721Metadata = false;
    let isERC721Enumerable = false;


    // If collection is already in db, no need to check state.
    const collectionId = getCollectionId(network.id, event.address);
    let collection = await Collection.get(collectionId);

    assert(event.transactionHash, "missing event.transactionHash")


    if (!collection) {
        try {
            isERC721 = await instance.supportsInterface('0x80ac58cd');

            if (!isERC721) {
                return;
            }
        } catch (e) {
            // If it is not an ERC721 interface, should just return
            return;
        }

        logger.info('collection not found')

        assert(event.args, 'No event args on erc721');

        try {
            // interface defined: https://eips.ethereum.org/EIPS/eip-721
            [isERC721Enumerable, isERC721Metadata] = await Promise.all([
                instance.supportsInterface('0x780e9d63'),
                instance.supportsInterface('0x5b5e139f'),
            ]);
        } catch {}

        let name: string | undefined;
        let symbol: string | undefined;

        if (isERC721Metadata) {
            [name, symbol] = await Promise.all([instance.name(), instance.symbol()]);
        }

        if (isERC721Enumerable) {
            totalSupply = (await instance.totalSupply()).toBigInt();
        }

        collection = Collection.create({
            id: collectionId,
            networkId: network.id,
            contract_address: event.address,
            created_block: BigInt(event.blockNumber),
            created_timestamp: BigInt(event.blockTimestamp.getTime()),
            creator_address: event.transactionHash,
            total_supply: totalSupply,
            name,
            symbol,
        });
        await collection.save();
        logger.info('new collection saved')
    }

    assert(event.args, 'No event args on erc721');

    const nftId = getNftId(collection.id, event.args.tokenId.toString());
    let nft = await Nft.get(nftId);

    if (!nft) {
        let metadataUri;
        try {
            metadataUri = isERC721Metadata
                ? await instance.tokenURI(event.args.tokenId)
                : undefined;
        } catch (e) {}

        nft = Nft.create({
            id: nftId,
            tokenId: event.args.tokenId.toString(),
            amount: BigInt(1),
            collectionId: collection.id,
            minted_block: BigInt(event.blockNumber),
            minted_timestamp: BigInt(event.blockTimestamp.getTime()),
            minter_address: event.transactionHash,
            current_owner: event.args.to,
            contract_type: ContractType.ERC721,
            metadata_uri: metadataUri,
            metadata_status: 'PENDING',
        } as Nft);

        try {
            collection.total_supply = isERC721Enumerable
                ? (await instance.totalSupply()).toBigInt()
                : incrementBigInt(collection.total_supply);
        } catch (e) {
            collection.total_supply = incrementBigInt(collection.total_supply);
        }

        await Promise.all([collection.save(), nft.save()]);
        logger.info('new nft savd, updated collections')
    }

    const transferId = getTransferId(
        network.id,
        event.transactionHash,
        event.logIndex.toString(),
        0
    );

    logger.info(` transfer: ${transferId}`)
    const transfer = Transfer.create({
        id: transferId,
        tokenId: event.args.tokenId.toString(),
        amount: BigInt(1),
        networkId: network.id,
        block: BigInt(event.blockNumber),
        timestamp: BigInt(event.blockTimestamp.getTime()),
        transaction_hash: event.transactionHash,
        nftId: nft.id,
        from: event.args.from,
        to: event.args.to,
    });

    await transfer.save();
}
