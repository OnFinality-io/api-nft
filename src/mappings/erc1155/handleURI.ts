import { URILog } from '../../types/abi-interfaces/Erc1155';
import { Nft } from '../../types';
import { getCollectionId, getNftId, hashId } from '../../utils/common';
import assert from 'assert';
import { handleMetadata } from '../../utils/utilHandlers';

export async function handleERC1155Uri(event: URILog): Promise<void> {
  const collectionId = getCollectionId(chainId, event.address);

  assert(event.args, 'No event args on erc1155');
  const nftId = getNftId(collectionId, event && event.args.id.toString());
  const nft = await Nft.get(nftId);

  if (!nft) {
    logger.error(
      `NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`
    );
    throw new Error(
      `NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`
    );
  }

  const metadataId = hashId(event.args.value);
  nft.metadataId = metadataId;
  await Promise.all([handleMetadata(metadataId, event.args.value), nft.save()]);
}
