import { Collection, Nft } from '../../types';
import { Erc1155__factory } from '../../types/contracts';
import { getCollectionId, getNftId } from '../../utils/common';
import { TransferBatchLog } from '../../types/abi-interfaces/Erc1155';
import {
  handle1155Nfts,
  handle1155Transfer,
  handleAddress,
} from '../../utils/utilHandlers';
import assert from 'assert';
import { BigNumber } from 'ethers';

export async function handleERC1155Batch(
  event: TransferBatchLog
): Promise<void> {
  const instance = Erc1155__factory.connect(event.address, api);

  let isERC1155Metadata = false;

  const collectionId = getCollectionId(chainId, event.address);
  const collection = await Collection.get(collectionId);

  assert(collection, `Missing collection: ${collectionId}`);

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
  // logger.info(`Handler triggered at ${event.transactionHash}`);

  // logger.info(`tokenIds length: ${tokenIds.length}`);
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
    handleAddress(event.args.to, event.transaction.from),
    handleAddress(event.args.from, event.transaction.from),
  ]);
}
