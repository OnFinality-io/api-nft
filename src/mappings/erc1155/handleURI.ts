import { URILog } from '../../types/abi-interfaces/Erc1155';
import { Nft } from '../../types';
import { getCollectionId, getNftId } from '../../utils/common';
import assert from 'assert';

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

  nft.metadataId = event.args.value;
  await nft.save();
}
