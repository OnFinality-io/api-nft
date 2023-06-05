import { Collection, Nft } from '../../types';
import { Erc1155__factory } from '../../types/contracts';
import { getCollectionId, getNftId } from '../../utils/common';
import { TransferBatchLog } from '../../types/abi-interfaces/Erc1155';
import {
  handle1155Nfts,
  handle1155Transfer,
} from '../../utils/utilHandlers';
import assert from 'assert';
import { BigNumber } from 'ethers';

export async function handleERC1155batch(
  event: TransferBatchLog
): Promise<void> {
  const instance = Erc1155__factory.connect(event.address, api);

  // let isErc1155 = false;
  // try {
  //   isErc1155 = await instance.supportsInterface('0xd9b67a26');
  // } catch (e) {
  //   return;
  // }
  //
  // if (!isErc1155) {
  //   return;
  // }

  let isERC1155Metadata = false;

  const collectionId = getCollectionId(chainId, event.address);
  const collection = await Collection.get(collectionId);

  assert(collection, `Missing collection: ${collectionId}`);

  // testing purpose only
  // if (!collection) {
  //   logger.warn(`collection missing on ${collectionId}`);
  //   return;
  // }

  assert(event.args, 'No event args on erc1155');
  try {
    // https://eips.ethereum.org/EIPS/eip-1155#abstract
    isERC1155Metadata = await instance.supportsInterface('0x0e89341c');
  } catch {}

  // TransferSingle (
  // 0 index_topic_ address operator,1
  // 1 index_topic_2 address from,
  // 2 index_topic_3 address to,
  // 3 uint256 id,
  // 4 uint256 value )

  const tokenIds: BigNumber[] = event.args.ids;

  const nfts = (
    await Promise.all(
      tokenIds.map(async (tokenId, idx) => {
        assert(event.args, 'No event args on erc1155');

        return handle1155Nfts(
          collection,
          tokenId,
          event.args[4][idx].toBigInt(), //values
          event,
          isERC1155Metadata,
          instance
        );
      })
    )
  ).filter(Boolean) as Nft[];

  const transfers = tokenIds.map((tokenId, idx) => {
    assert(event.args, 'No event args on erc1155');

    return handle1155Transfer(
      chainId,
      event,
      tokenId.toString(),
      event.args[4][idx].toBigInt(), //values
      getNftId(collectionId, tokenId.toString()),
      idx
    );
  });

  await Promise.all([
    store.bulkUpdate('Nft', nfts),
    store.bulkUpdate('Transfer', transfers),
  ]);
}
