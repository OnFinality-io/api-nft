import { URILog } from '../../types/abi-interfaces/Erc1155';
import { Nft } from '../../types';
import { getCollectionId, getNftId, hashId } from '../../utils/common';
import assert from 'assert';
import { handleMetadata } from '../../utils/utilHandlers';
import { bypassContractNfts } from '../../utils/constants';

export async function handleERC1155Uri(event: URILog): Promise<void> {
  if (
    bypassContractNfts.includes(event.address.toLowerCase())
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
    // Many of NFT contracts sets URI prior to the NFT mint
    // Hence, it is more efficient to skip rather than to throw
    logger.warn(
        `NFT: ${nftId} has not been minted, skipping setURI event`
    );
    return;
  }

  const metadataId = hashId(event.args.value);
  nft.metadataId = metadataId;
  await Promise.all([handleMetadata(metadataId, event.args.value), nft.save()]);
}
