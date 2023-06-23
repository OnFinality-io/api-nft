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
  Transfer,
} from '../types';
import { BigNumber } from 'ethers';
import {
  getAddressId,
  getCollectionId,
  getNftId,
  getTransferId,
  hashId,
  incrementBigInt,
} from './common';
import { Erc1155, Erc1155__factory, Erc721__factory } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';
import { blackListedAddresses } from './constants';
import { TransferLog } from '../types/abi-interfaces/Erc721';

export async function handleMetadata(
  id: string,
  metadataUri: string
): Promise<void> {
  let metadata = await Metadata.get(id);

  if (!metadata) {
    metadata = Metadata.create({
      id,
      metadata_uri: metadataUri,
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

export async function handleAddress(
  address: string,
  creator: string,
  account?: string
): Promise<void> {
  const addressId = getAddressId(address, creator);
  let addressEntity = await Address.get(addressId);

  if (!addressEntity) {
    addressEntity = Address.create({
      id: addressId,
      networkId: chainId,
      accountId: account,
    });
  }
  await addressEntity.save();
  logger.info(` new address: ${addressId} saved`);
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
    let metadataId;

    if (isERC1155Metadata) {
      try {
        metadataUri = await instance.uri(tokenId);
      } catch {
        logger.warn(
          `Contract uri instance broken at address ${event.address.toLowerCase()}`
        );
      }
    }

    if (metadataUri) {
      metadataId = hashId(metadataUri);
      await handleMetadata(metadataId, metadataUri);
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
      metadataId,
    });
  } else {
    // If NFT exist, should update the current_owner
    nft.current_owner = event.args.to.toLowerCase();
    await nft.save();
  }
}
export async function handle721Transfer(
  networkId: string,
  event: TransferLog,
  nftId: string,
  batchIndex = 0
): Promise<void> {
  assert(event.args, 'No event args on erc721');
  const transferId = getTransferId(
    chainId,
    event.transactionHash,
    event.logIndex.toString(),
    batchIndex
  );
  let transfer = await Transfer.get(transferId);
  if (!transfer) {
    transfer = Transfer.create({
      id: transferId,
      tokenId: event.args.tokenId.toString(),
      amount: BigInt(1),
      networkId: chainId,
      block: BigInt(event.blockNumber),
      timestamp: event.block.timestamp,
      transaction_hash: event.transactionHash,
      nftId,
      from: event.args.from.toLowerCase(),
      to: event.args.to.toLowerCase(),
    });

    await transfer.save();
    logger.info(
      `new transfer: ${transferId} saved, at block: ${event.blockNumber}`
    );
  }
}

export async function handle1155Transfer(
  networkId: string,
  event: TransferBatchLog,
  tokenId: string,
  amount: bigint,
  nftId: string,
  batchIndex = 0
): Promise<Transfer | undefined> {
  assert(event.args, 'No event args');

  const transferId = getTransferId(
    networkId,
    event.transactionHash,
    event.logIndex.toString(),
    batchIndex
  );

  const transfer = await Transfer.get(transferId);
  if (transfer) {
    logger.info(
      `Skipping transfer: ${transferId} at block: ${event.blockNumber}`
    );
    return;
  }

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
  creatorAddress: string
): Promise<void> {
  // BlackListed Contract Address
  if (blackListedAddresses.includes(address)) {
    logger.warn(`Address: ${address} is blackListed`);
    return;
  }

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
  } catch (e: any) {
    if (e?.code === 'CALL_EXCEPTION') return; // Contract does not implement erc165
    throw new Error(e);
  }

  if (isErc1155 && isErc721) {
    logger.error(
      `Contract: ${address.toLowerCase()} implements both interfaces at ${blockNumber}`
    );
    throw new Error(
      `Contract: ${address.toLowerCase()} implements both interfaces`
    );
  }

  const casedAddress = address.toLowerCase();

  const collectionId = getCollectionId(chainId, address);
  const collection = await Collection.get(collectionId);
  if (collection) {
    logger.info(`Skipping collection: ${collectionId} as it exists already`);
    return;
  }

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
      total_supply: BigInt(0),
      contract_type: ContractType.ERC1155,
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
      } catch (e: any) {
        logger.error(`Failed to get name && symbol for contract: ${address}`);
        throw new Error(e);
      }
    }

    let totalSupplyResult = BigNumber.from(0);
    if (isERC721Enumerable) {
      try {
        totalSupplyResult = await erc721Instance.totalSupply();
      } catch {
        logger.warn(`Failed to get erc721 totalSupply, totalSupply set to 0`);
      }
    }

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: creatorAddress.toLowerCase(),
      total_supply: totalSupplyResult.toBigInt(),
      name,
      symbol,
      contract_type: ContractType.ERC721,
    });
    await collection.save();
  }
}
