import {
  Collection,
  ContractType,
  createERC1155Datasource,
  createERC721Datasource,
  Metadata,
  Network,
  Nft,
  StatusType,
  Transfer,
} from '../types';
import { BigNumber } from 'ethers';
import {
  getCollectionId,
  getNftId,
  getTransferId,
  incrementBigInt,
} from './common';
import { Erc1155, Erc1155__factory, Erc721, Erc721__factory } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';

export async function handleMetadata(id: string): Promise<void> {
  let metdata = await Metadata.get(id);

  if (!metdata) {
    metdata = Metadata.create({
      id,
      metadata_status: StatusType.PENDING,
    });
    await metdata.save();
  }
}

export async function handleNetwork(id: string): Promise<void> {
  let network = await Network.get(id);
  if (!network) {
    network = Network.create({
      id,
    });
    await network.save();
  }
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

    if (metadataUri) {
      await handleMetadata(metadataUri);
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
      metadataId: metadataUri,
    });
  }
}

export function handle1155Transfer(
  networkId: string,
  event: TransferBatchLog,
  tokenId: string,
  amount: bigint,
  nftId: string,
  batchIndex = 0
): Transfer {
  assert(event.args, 'No event args');

  const transferId = getTransferId(
    networkId,
    event.transactionHash,
    event.logIndex.toString(),
    batchIndex
  );
  return Transfer.create({
    id: transferId,
    tokenId,
    amount: amount,
    networkId: networkId,
    block: BigInt(event.blockNumber),
    timestamp: event.block.timestamp,
    transaction_hash: event.transactionHash,
    nftId: nftId,
    from: event.args.from, // from
    to: event.args.to,
  });
}

export async function handleDsCreation(
  address: string,
  blockNumber: bigint,
  timestamp: bigint,
  creatorAddress: string,
): Promise<void> {
  let isErc1155 = false;
  let isErc721 = false;

  const erc1155Instance = Erc1155__factory.connect(address, api);
  const erc721Instance = Erc721__factory.connect(address, api);

  await handleNetwork(chainId);

  try {
    [isErc1155, isErc721] = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd'),
    ]);
  } catch (e) {
    if (!isErc721 && !isErc1155) {
      return;
    }
  }

  const casedAddress = address.toLowerCase();

  const collectionId = getCollectionId(chainId, address);
  let totalSupply = BigInt(0);

  if (isErc1155) {
    logger.info(`is erc1155, address=${address}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC1155Datasource({
      casedAddress,
    });

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: creatorAddress,
      total_supply: totalSupply,
    });
    await collection.save();
  }

  if (isErc721) {
    logger.info(`is erc721, address=${address}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC721Datasource({
      casedAddress,
    });

    let isERC721Metadata = false;
    let isERC721Enumerable = false;

    try {
      // interface defined: https://eips.ethereum.org/EIPS/eip-721
      [isERC721Enumerable, isERC721Metadata] = await Promise.all([
        erc721Instance.supportsInterface('0x780e9d63'),
        erc721Instance.supportsInterface('0x5b5e139f'),
      ]);
    } catch {}

    let name: string | undefined;
    let symbol: string | undefined;

    if (isERC721Metadata) {
      [name, symbol] = await Promise.all([
        erc721Instance.name(),
        erc721Instance.symbol(),
      ]);
    }

    if (isERC721Enumerable) {
      totalSupply = (await erc721Instance.totalSupply()).toBigInt();
    }

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: creatorAddress,
      total_supply: totalSupply,
      name,
      symbol,
    });
    await collection.save();
  }
  // }
}
