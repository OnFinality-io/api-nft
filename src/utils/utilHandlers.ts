import {
  Address,
  BlacklistedAddresses,
  Collection,
  ContractType,
  Metadata,
  Network,
  Nft,
  StatusType,
  Transfer,
} from '../types';
import { BigNumber } from 'ethers';
import {
  getAddressId,
  getBlacklistId,
  getCollectionId,
  getNftId,
  getTransferId,
  hashId,
  incrementBigInt,
} from './common';
import { Erc1155, Erc1155__factory, Erc721__factory } from '../types/contracts';
import assert from 'assert';
import { TransferBatchLog } from '../types/abi-interfaces/Erc1155';
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
): Promise<Transfer | undefined> {
  assert(event.args, 'No event args on erc721');

  const transferId = getTransferId(
    chainId,
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

export async function interfaceCheck(
  contractAddress: string
): Promise<[boolean, boolean]> {
  const blacklistId = getBlacklistId(chainId, contractAddress);
  const nonNFTContractAddresses = await BlacklistedAddresses.get(blacklistId);
  if (nonNFTContractAddresses) return [false, false];

  let isErc1155 = false;
  let isErc721 = false;

  const erc1155Instance = Erc1155__factory.connect(contractAddress, api);
  const erc721Instance = Erc721__factory.connect(contractAddress, api);

  try {
    [isErc1155, isErc721] = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd'),
    ]);
  } catch (e: any) {
    if (e?.code === 'CALL_EXCEPTION') {
      // add to blacklist
      const blacklistId = getBlacklistId(chainId, contractAddress);

      await BlacklistedAddresses.create({
        id: blacklistId,
      }).save();
      return [false, false];
    } // Contract does not implement erc165
    throw new Error(e);
  }

  if (isErc1155 && isErc721) {
    logger.error(
      `Contract: ${contractAddress.toLowerCase()} implements both interfaces`
    );
    throw new Error(
      `Contract: ${contractAddress.toLowerCase()} implements both interfaces`
    );
  }

  return [isErc1155, isErc721];
}

export async function handleCollection(
  contractType: ContractType,
  contractAddress: string,
  blockNumber: bigint,
  timestamp: bigint,
  creatorAddress: string
): Promise<void> {
  const casedContractAddress = contractAddress.toLowerCase();
  const casedCreatorAddress = creatorAddress.toLowerCase();

  const collectionId = getCollectionId(chainId, casedContractAddress);

  if (contractType === ContractType.ERC721) {
    logger.info(`is erc721, address=${casedContractAddress}`);
    const erc721Instance = Erc721__factory.connect(casedContractAddress, api);

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
        logger.error(
          `Failed to get name && symbol for contract: ${casedContractAddress}`
        );
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
      contract_address: casedContractAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: casedCreatorAddress,
      total_supply: totalSupplyResult.toBigInt(),
      name,
      symbol,
      contract_type: contractType,
    });
    await collection.save();
  }

  if (contractType === ContractType.ERC1155) {
    logger.info(`is erc1155, address=${casedContractAddress}`);

    const collection = Collection.create({
      id: collectionId,
      networkId: chainId,
      contract_address: casedContractAddress,
      created_block: blockNumber,
      created_timestamp: timestamp,
      creator_address: casedCreatorAddress,
      total_supply: BigInt(0),
      contract_type: contractType,
    });
    await collection.save();
  }
}

export async function collectionController(event: {
  address: string;
  blockNumber: number;
  block: { timestamp: bigint };
  transaction: { from: string };
}): Promise<void> {
  // check if apart from blacklist table
  const casedContractAddress = event.address.toLowerCase();

  await handleNetwork(chainId);

  const collectionId = getCollectionId(chainId, casedContractAddress);
  const collection = await Collection.get(collectionId);
  if (collection) {
    logger.info(`Skipping collection: ${collectionId} as it exists already`);
    return;
  }

  // Check if desired interface
  const [isErc1155, isErc721] = await interfaceCheck(event.address);

  if (!isErc721 && !isErc1155) {
    throw new Error('Contract does not implement erc165');
  }

  const contractType = isErc1155 ? ContractType.ERC1155 : ContractType.ERC721;

  // HandleCollections
  await handleCollection(
    contractType,
    event.address,
    BigInt(event.blockNumber),
    event.block.timestamp,
    event.transaction.from
  );
}
