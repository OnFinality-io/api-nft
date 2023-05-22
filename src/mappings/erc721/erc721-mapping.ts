import { Collection, ContractType, Nft, Transfer } from '../../types';
import { Erc721__factory } from '../../types/contracts';
import { TransferLog } from '../../types/abi-interfaces/Erc721';
import {
  getCollectionId,
  getNftId,
  getTransferId,
  incrementBigInt,
} from '../../utils/common';
import { handleNetwork } from '../../utils/utilHandlers';
import assert from 'assert';

export async function handleERC721(event: TransferLog): Promise<void> {
  const network = await handleNetwork(chainId);
  const instance = Erc721__factory.connect(event.address, api);
  let totalSupply = BigInt(0);
  let isERC721 = false;

  let isERC721Metadata = false;
  let isERC721Enumerable = false;


  // If collection is already in db, no need to check state.
  const collectionId = getCollectionId(network.id, event.address);
  let collection = await Collection.get(collectionId);


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
      created_timestamp: event.block.timestamp,
      creator_address: event.transaction.from,
      total_supply: totalSupply,
      name,
      symbol,
    });
    await collection.save();
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
      minted_timestamp: event.block.timestamp,
      minter_address: event.transaction.from,
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
  }

  const transferId = getTransferId(
    network.id,
    event.transactionHash,
    event.logIndex.toString(),
    0
  );

  const transfer = Transfer.create({
    id: transferId,
    tokenId: event.args.tokenId.toString(),
    amount: BigInt(1),
    networkId: network.id,
    block: BigInt(event.blockNumber),
    timestamp: event.block.timestamp,
    transaction_hash: event.transactionHash,
    nftId: nft.id,
    from: event.args.from,
    to: event.args.to,
  });

  await transfer.save();
}
