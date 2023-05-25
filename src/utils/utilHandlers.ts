import { Collection, ContractType, Network, Nft, Transfer } from '../types';
import { BigNumber } from 'ethers';
import {
  getCollectionId,
  getNftId,
  getTransferId,
  incrementBigInt,
} from './common';
import { Erc1155 } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';

export async function handleNetwork(id: string): Promise<Network> {
  let network = await Network.get(id);
  if (!network) {
    network = Network.create({
      id,
    });
    await network.save();
  }
  return network;
}

// export async function handle1155Collections(
//   network: Network,
//   event: TransferBatchLog
// ): Promise<Collection> {
//
//   return collection;
// }

export async function handle1155Nfts(
  collection: Collection,
  tokenId: BigNumber,
  amount: bigint,
  event: TransferBatchLog,
  isERC1155Metadata: boolean,
  instance: Erc1155
): Promise<Nft | undefined> {
  assert(event.args, 'No event args on erc1155');

  const nftId = getNftId(collection.id, tokenId.toString());
  const nft = await Nft.get(nftId);

  if (!nft) {
    let metadataUri;

    if (isERC1155Metadata) {
      try {
        metadataUri = await instance.uri(tokenId);
      } catch {
        logger.warn(`Contract uri instance broken at address ${event.address}`);
      }
    }
    collection.total_supply = incrementBigInt(collection.total_supply);

    // must be saved everytime new NFT is created
    await collection.save();

    return Nft.create({
      id: nftId,
      tokenId: tokenId.toString(),
      amount: amount,
      collectionId: collection.id,
      minted_block: BigInt(event.blockNumber),
      minted_timestamp: event.block.timestamp,
      minter_address: event.address,
      current_owner: event.args.to,
      contract_type: ContractType.ERC1155,
      metadata_uriId: metadataUri,
      metadata_status: "PENDING"
    });
  }
}

export function handle1155Transfer(
  network: Network,
  event: TransferBatchLog,
  tokenId: string,
  amount: bigint,
  nftId: string,
  batchIndex = 0
): Transfer {
  assert(event.args, 'No event args');

  const transferId = getTransferId(
    network.id,
    event.transactionHash,
    event.logIndex.toString(),
    batchIndex
  );
  return Transfer.create({
    id: transferId,
    tokenId,
    amount: amount,
    networkId: network.id,
    block: BigInt(event.blockNumber),
    timestamp: event.block.timestamp,
    transaction_hash: event.transactionHash,
    nftId: nftId,
    from: event.args.from, // from
    to: event.args.to,
  });
}
