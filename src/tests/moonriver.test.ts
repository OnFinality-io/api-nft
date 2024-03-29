import { subqlTest } from '@subql/testing';
import {
  Address,
  Collection,
  ContractType,
  Metadata,
  Network,
  Nft,
  StatusType,
  Transfer,
} from '../types';

// Should handleTransaction && handleContractUpgrade, for collections
// no new Collections should be added
// Look at the logs for this one
// Use project-moonriver.yaml instead of the testing one. Until subql-test supports dynamic DS
// subqlTest(
//   'Should skip collection creation, if ID already exists in DB',
//   664201,
//   [
//     Network.create({
//       id: '1285',
//     }),
//     Collection.create({
//       id: 'bad-collection-name',
//       networkId: '1285',
//       contract_address: '0x1974eeaf317ecf792ff307f25a3521c35eecde86',
//       created_block: BigInt(664201),
//       created_timestamp: BigInt(1633443594),
//       creator_address: '0x05b9b543328d4c797e1eec747efc65d97de542f2',
//       total_supply: BigInt(1),
//       name: 'bad nft',
//       symbol: 'bad nft',
//       contract_type: ContractType.ERC1155,
//     }),
//   ],
//   [
//     Collection.create({
//       id: 'bad-collection-name',
//       networkId: '1285',
//       contract_address: '0x1974eeaf317ecf792ff307f25a3521c35eecde86',
//       created_block: BigInt(664201),
//       created_timestamp: BigInt(1633443594),
//       creator_address: '0x05b9b543328d4c797e1eec747efc65d97de542f2',
//       total_supply: BigInt(1),
//       name: 'bad nft',
//       symbol: 'bad nft',
//       contract_type: ContractType.ERC1155,
//     }),
//   ],
//   'handleTransaction'
// );

// If erc721 exists, should not add/update nft, transfers,
// should not throw, ID should be unique
subqlTest(
  'erc721 exist should not add/update nft, transfers or collections',
  568909,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      networkId: '1285',
      contract_address: '0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      created_block: BigInt(568674),
      created_timestamp: BigInt(1632156918),
      creator_address: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      total_supply: BigInt(1),
      name: 'WiseMovrs',
      symbol: 'WISE',
      contract_type: ContractType.ERC721,
    }),
    Nft.create({
      id: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af-128',
      tokenId: '128',
      amount: BigInt(1),
      collectionId: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      minted_block: BigInt(568909),
      minted_timestamp: BigInt(1632160200),
      minter_address: 'mock',
      current_owner: 'mock',
      metadataId: '0x77ebbdaa2e8797de',
    }),
    Metadata.create({
      id: '0x77ebbdaa2e8797de',
      metadata_uri:
        'https://gateway.pinata.cloud/ipfs/QmTJ9GKvSzw3tNANqwPzdmFT5LrHzSR8LPk47MWUsmTr5J/1',
      metadata_status: StatusType.PENDING,
    }),
    Transfer.create({
      id: '0x7b32ee8b20d454bcd0047ac14d8b5fe1c140ea0f85a06cf95c992c835a32367a-87-0-1285',
      tokenId: '128',
      amount: BigInt(1),
      networkId: '1285',
      block: BigInt(568909),
      timestamp: BigInt(1632160200),
      transaction_hash:
        '0x7b32ee8b20d454bcd0047ac14d8b5fe1c140ea0f85a06cf95c992c835a32367a',
      nftId: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af-128',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
    }),
    Address.create({
      id: '0x2584995977d297af3cc4f0a967dc8bda33d7a225-0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      networkId: '1285',
    }),
    Address.create({
      id: '0x0000000000000000000000000000000000000000-0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      networkId: '1285',
    }),
  ],
  [
    Nft.create({
      id: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af-128',
      tokenId: '128',
      amount: BigInt(1),
      collectionId: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      minted_block: BigInt(568909),
      minted_timestamp: BigInt(1632160200),
      minter_address: 'mock',
      // Only current owner should update.
      current_owner: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      metadataId: '0x77ebbdaa2e8797de',
    }),
  ],
  'handleERC721Transfer'
);

// If erc1155 exists, should not add/update nft
subqlTest(
  'Should not total collections',
  1017076,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(0),
      name: 'mock',
      symbol: 'mock',
      contract_type: ContractType.ERC1155,
    }),
  ],
  // There should be 4 minting for this contract on this block, but totalSupply should not increase
  [
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(4),
      name: 'mock',
      symbol: 'mock',
      contract_type: ContractType.ERC1155,
    }),
  ],
  'handleERC1155Single'
);

subqlTest(
  'Should not increment total_supply on  collections if exisiting already',
  1017076,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(4),
      name: 'fake',
      symbol: 'fake',
      contract_type: ContractType.ERC1155,
    }),
    Nft.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e-8',
      tokenId: '8',
      amount: BigInt(50),
      collectionId: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      minted_block: BigInt(1017076),
      minted_timestamp: BigInt(1638614052),
      minter_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      current_owner: '0x25b928897c8cfaa4242d5476251d73fc3d1f0bb9',
      metadataId: '0x5c51286ebe2e9cc0',
    }),
    Nft.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e-9',
      tokenId: '9',
      amount: BigInt(50),
      collectionId: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      minted_block: BigInt(1017076),
      minted_timestamp: BigInt(1638614052),
      minter_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      current_owner: '0x25b928897c8cfaa4242d5476251d73fc3d1f0bb9',
      metadataId: '0x04633c470996a9a7',
    }),
    Nft.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e-10',
      tokenId: '10',
      amount: BigInt(50),
      collectionId: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      minted_block: BigInt(1017076),
      minted_timestamp: BigInt(1638614052),
      minter_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      current_owner: '0x25b928897c8cfaa4242d5476251d73fc3d1f0bb9',
      metadataId: '0xe27873ad0ee26f9b',
    }),
    Nft.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e-11',
      tokenId: '11',
      amount: BigInt(50),
      collectionId: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      minted_block: BigInt(1017076),
      minted_timestamp: BigInt(1638614052),
      minter_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      current_owner: '0x25b928897c8cfaa4242d5476251d73fc3d1f0bb9',
      metadataId: '0x3cf1202b0bc1cf96',
    }),
    Metadata.create({
      id: '0x5c51286ebe2e9cc0',
      metadata_uri: '',
      metadata_status: StatusType.PENDING,
    }),
    Metadata.create({
      id: '0x04633c470996a9a7',
      metadata_uri: '',
      metadata_status: StatusType.PENDING,
    }),
    Metadata.create({
      id: '0xe27873ad0ee26f9b',
      metadata_uri: '',
      metadata_status: StatusType.PENDING,
    }),
    Metadata.create({
      id: '0x3cf1202b0bc1cf96',
      metadata_uri: '',
      metadata_status: StatusType.PENDING,
    }),
  ],
  // There should be 4 minting for this contract on this block, but totalSupply should not increase
  [
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(4),
      name: 'fake',
      symbol: 'fake',
      contract_type: ContractType.ERC1155,
    }),
  ],
  'handleERC1155Single'
);

subqlTest(
  'Should increment total collections, if missing NFTs',
  1017076,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(0),
      name: 'mock',
      symbol: 'mock',
      contract_type: ContractType.ERC1155,
    }),
  ],
  // There should be 8 minting for this contract on this block, but totalSupply should not increase
  [
    Collection.create({
      id: '1285-0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      networkId: '1285',
      contract_address: '0x7baa8ba7cb575e3c599d3bf316870ba591b6ba8e',
      created_block: BigInt(1017072),
      created_timestamp: BigInt(1638614004),
      creator_address: '0x123dd403359ce45809e21deced7747418d6c8213',
      total_supply: BigInt(4),
      name: 'mock',
      symbol: 'mock',
      contract_type: ContractType.ERC1155,
    }),
  ],
  'handleERC1155Single'
);

// // Should not update existing any handleErc1155, for nfts, and transfers, collections
subqlTest(
  'erc721, if nft, transfer, metadata, address does not exists should insert',
  568909,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      networkId: '1285',
      contract_address: '0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      created_block: BigInt(568674),
      created_timestamp: BigInt(1632156918),
      creator_address: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      total_supply: BigInt(1),
      name: 'WiseMovrs',
      symbol: 'WISE',
      contract_type: ContractType.ERC721,
    }),
  ],
  [
    Nft.create({
      id: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af-128',
      tokenId: '128',
      amount: BigInt(1),
      collectionId: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af',
      minted_block: BigInt(568909),
      minted_timestamp: BigInt(1632160200),
      minter_address: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      current_owner: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      metadataId: '0x77ebbdaa2e8797de',
    }),
    Metadata.create({
      id: '0x77ebbdaa2e8797de',
      metadata_uri:
        'https://gateway.pinata.cloud/ipfs/QmTJ9GKvSzw3tNANqwPzdmFT5LrHzSR8LPk47MWUsmTr5J/1',
      metadata_status: StatusType.PENDING,
    }),
    Transfer.create({
      id: '0x7b32ee8b20d454bcd0047ac14d8b5fe1c140ea0f85a06cf95c992c835a32367a-87-0-1285',
      tokenId: '128',
      amount: BigInt(1),
      networkId: '1285',
      block: BigInt(568909),
      timestamp: BigInt(1632160200),
      transaction_hash:
        '0x7b32ee8b20d454bcd0047ac14d8b5fe1c140ea0f85a06cf95c992c835a32367a',
      nftId: '1285-0xb6aadea9265a49f65c8e6d6238f214bad46e58af-128',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x2584995977d297af3cc4f0a967dc8bda33d7a225',
    }),
    Address.create({
      id: '0x2584995977d297af3cc4f0a967dc8bda33d7a225-0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      networkId: '1285',
    }),
    Address.create({
      id: '0x0000000000000000000000000000000000000000-0x2584995977d297af3cc4f0a967dc8bda33d7a225',
      networkId: '1285',
    }),
  ],
  'handleERC721Transfer'
);
