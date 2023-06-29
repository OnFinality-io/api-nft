import { Collection, Nft, Transfer } from '../../types';
import { Erc721__factory } from '../../types/contracts';
import { TransferLog } from '../../types/abi-interfaces/Erc721';
import {
  getCollectionId,
  getNftId,
  hashId,
  incrementBigInt,
} from '../../utils/common';
import {
  handle721Transfer,
  handleAddress,
  handleMetadata,
} from '../../utils/utilHandlers';
import assert from 'assert';
import { erc721BigTransactions } from '../../utils/constants';

export async function handleERC721(event: TransferLog): Promise<void> {
  const instance = Erc721__factory.connect(event.address, api);

  // If collection is already in db, no need to check state.
  const collectionId = getCollectionId(chainId, event.address);
  const collection = await Collection.get(collectionId);

  assert(collection, `Missing collection: ${collectionId}`);
  assert(event.args, 'No event args on erc721');

  const nftId = getNftId(collection.id, event.args.tokenId.toString());

  let nft = erc721BigTransactions.includes(event.transactionHash)
    ? undefined
    : await Nft.get(nftId);

  if (!nft) {
    let metadataId: string | undefined;

    // metadata possibly undefined
    // nft can share same metadata
    // if collection.name and symbol exist, meaning there is metadata on this contract
    const [uriResult, totalSupplyResult] = await Promise.allSettled([
      collection.name || collection.symbol
        ? instance.tokenURI(event.args.tokenId)
        : undefined,
      instance.totalSupply(),
    ]);

    if (uriResult?.status === 'fulfilled') {
      const value = uriResult.value;
      if (value) {
        metadataId = hashId(value);
        await handleMetadata(metadataId, value);
      }
    }
    if (totalSupplyResult.status === 'fulfilled') {
      collection.total_supply = totalSupplyResult.value.toBigInt();
    } else {
      collection.total_supply = incrementBigInt(collection.total_supply);
    }

    nft = Nft.create({
      id: nftId,
      tokenId: event.args.tokenId.toString(),
      amount: BigInt(1),
      collectionId: collection.id,
      minted_block: BigInt(event.blockNumber),
      minted_timestamp: event.block.timestamp,
      minter_address: event.transaction.from.toLowerCase(),
      current_owner: event.args.to.toLowerCase(),
      metadataId,
    });

    await Promise.all([collection.save(), nft.save()]);
  } else {
    // If NFT exist, should update the current_owner
    nft.current_owner = event.args.to.toLowerCase();
    await nft.save();
  }
  const transfer = await handle721Transfer(chainId, event, nft.id);

  await Promise.all([
    transfer && transfer.save(),
    handleAddress(event.args.to, event.transaction.from),
    handleAddress(event.args.from, event.transaction.from),
  ]);
}
