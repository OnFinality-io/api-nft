import { URILog } from '../../types/abi-interfaces/Erc1155';
import { Nft } from '../../types';
import { getCollectionId, getNftId, hashId } from '../../utils/common';
import assert from 'assert';
import { handleMetadata } from '../../utils/utilHandlers';
import { bypassContractNfts, bypassUnmintedUriTx } from '../../utils/constants';

export async function handleERC1155Uri(event: URILog): Promise<void> {
  if (
    bypassContractNfts.includes(event.address.toLowerCase()) ||
    bypassUnmintedUriTx.includes(event.transactionHash)
  ) {
    logger.warn(
      `Bypassing invalid contract: ${event.address.toLowerCase()} at TX: ${
        event.transactionHash
      }`
    );
    return;
  }
  const collectionId = getCollectionId(chainId, event.address.toLowerCase());

  assert(event.args, 'No event args on erc1155');
  const nftId = getNftId(collectionId, event && event.args.id.toString());
  const nft = await Nft.get(nftId);

  if (!nft) {
    throw new Error(
      `NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`
    );
  }

  const metadataId = hashId(event.args.value);
  nft.metadataId = metadataId;
  await Promise.all([handleMetadata(metadataId, event.args.value), nft.save()]);
}
