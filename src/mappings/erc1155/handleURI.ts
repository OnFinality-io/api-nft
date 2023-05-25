import { URILog } from '../../types/abi-interfaces/Erc1155';
import { Erc1155__factory } from '../../types/contracts';
import { Collection, Nft } from '../../types';
import { getCollectionId, getNftId } from '../../utils/common';
import { handleNetwork } from '../../utils/utilHandlers';
import assert from 'assert';

export async function handleERC1155Uri(event: URILog): Promise<void> {
  const instance = Erc1155__factory.connect(event.address, api);

  const network = await handleNetwork(chainId);
  const collectionId = getCollectionId(network.id, event.address);

  const collection = await Collection.get(collectionId);

  if (!collection) {
    try {
      // https://eips.ethereum.org/EIPS/eip-1155#abstract
      const isERC1155 = await instance.supportsInterface('0xd9b67a26');

      if (!isERC1155) {
        return;
      }
    } catch (e) {
      return;
    }
  }

  assert(event.args, 'No event args on erc1155');
  const nftId = getNftId(collectionId, event && event.args.id.toString());

  const nft = await Nft.get(nftId);

  if (!nft) {
    // I think this should throw, possible missing data
    logger.error(
      `NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`
    );
    return;
  }
  nft.metadataId = event.args.value;
  await nft.save();
}
