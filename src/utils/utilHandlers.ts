import {
  Address,
  Collection,
  ContractType,
  createERC1155Datasource,
  createERC721Datasource,
  Metadata,
  Network,
  Nft,
  StatusType,
  Transfer
} from '../types';
import { BigNumber } from 'ethers';
import {
  getAddressId,
  getCollectionId,
  getNftId,
  getTransferId,
  incrementBigInt
} from './common';
import { Erc1155, Erc1155__factory, Erc721__factory } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';

export async function handleMetadata(id: string): Promise<void> {
  let metadata = await Metadata.get(id.toString());

  if (!metadata) {
    metadata = Metadata.create({
      id: id.toString(),
      metadata_status: StatusType.PENDING,
    });
    await metadata.save();
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


export async function handleAddress(address: string, creator: string, account?: string): Promise<void> {
  const addressId = getAddressId(address, creator);
  let addressEntity = await Address.get(addressId);

  if(!addressEntity) {
    addressEntity = Address.create({
      id: addressId,
      networkId: chainId,
      accountId: account
    });
  }
  await addressEntity.save();
}

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
        logger.warn(`Contract uri instance broken at address ${event.address.toLowerCase()}`);
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
      minter_address: event.address.toLowerCase(),
      current_owner: event.args.to.toLowerCase(),
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
    from: event.args.from.toLowerCase(), // from
    to: event.args.to.toLowerCase(),
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

  // Check interface
  try {
    [isErc1155, isErc721] = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd'),
    ]);
  } catch (e) {
    // if both are false then there is no point, return
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
      address: casedAddress,
    });

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: creatorAddress.toLowerCase(),
      total_supply: totalSupply,
    });
    await collection.save();
  }

  if (isErc721) {
    logger.info(`is erc721, address=${address}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC721Datasource({
      address: casedAddress,
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
      try {
        [name, symbol] = await Promise.all([
          erc721Instance.name(),
          erc721Instance.symbol(),
        ]);
      } catch (e) {}
    }

    if (isERC721Enumerable) {
      try {
        totalSupply = (await erc721Instance.totalSupply()).toBigInt();
      } catch {}
    }

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: creatorAddress.toLowerCase(),
      total_supply: totalSupply,
      name,
      symbol,
    });
    await collection.save();
  }
}
