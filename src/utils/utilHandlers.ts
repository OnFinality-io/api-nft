import { Collection, ContractType, Network, Nft, Transfer } from '../types';
import { BigNumber } from 'ethers';
import {
  getNftId,
  getTransferId,
  incrementBigInt,
} from './common';
import { Erc1155 } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';
import {TransferBatchEvent} from "../types/contracts/Erc1155";
import {FrontierEvmEvent} from "@subql/frontier-evm-processor";

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

export async function handle1155Nfts(
  collection: Collection,
  tokenId: BigNumber,
  amount: bigint,
  event: FrontierEvmEvent<TransferBatchEvent['args']>,
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

    // must be saved everytime ew NFT is created
    await collection.save();

    return Nft.create({
      id: nftId,
      tokenId: tokenId.toString(),
      amount: amount,
      collectionId: collection.id,
      minted_block: BigInt(event.blockNumber),
      minted_timestamp: BigInt(event.blockTimestamp.getTime()),
      minter_address: event.address,
      current_owner: event.args.to,
      contract_type: ContractType.ERC1155,
      metadata_uri: metadataUri,
      metadata_status: 'PENDING',
    });
  }
}

export function handle1155Transfer(
  network: Network,
  event: FrontierEvmEvent<TransferBatchEvent['args']>,
  tokenId: string,
  amount: bigint,
  nftId: string,
  batchIndex = 0
): Transfer {
  assert(event.args, 'No event args');
  assert(event.transactionHash, 'No event.transactionHash');

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
    timestamp:  BigInt(event.blockTimestamp.getTime()),
    transaction_hash: event.transactionHash,
    nftId: nftId,
    from: event.args.from, // from
    to: event.args.to,
  });
}
