import { subqlTest } from '@subql/testing';
import { Collection, ContractType, Network } from '../types';

// test for correct Total_supply

// Should not creation collection if contract address does not implement erc165

// subqlTest(
//   'Contract address interface check',
//   997902,
//   [
//     Network.create({
//       id: '1284',
//     }),
//   ],
//   [Collection.create({})],
//   'handleTransaction'
// );

// Total Supply increments when failing to get totalSupply from chain
// subqlTest(
//   'Increment total supply',
//   991041,
//   [
//     Network.create({
//       id: '1284',
//     }),
//     Collection.create({
//       id: '1284-0x7d5f0398549c9fdea03bbdde388361827cb376d5',
//       networkId: '1284',
//       contract_address: '0x7d5f0398549c9fdea03bbdde388361827cb376d5',
//       created_block: BigInt(895456),
//       created_timestamp: BigInt(1650903414),
//       creator_address: '0x0685cd85e129ed712401928cbc6619300e0b2f4f',
//       total_supply: BigInt(8144),
//       contract_type: ContractType.ERC721,
//       name: 'PNS',
//       symbol: 'PNS',
//     }),
//   ],
//   [
//     Collection.create({
//       id: '1284-0x7d5f0398549c9fdea03bbdde388361827cb376d5',
//       networkId: '1284',
//       contract_address: '0x7d5f0398549c9fdea03bbdde388361827cb376d5',
//       created_block: BigInt(895456),
//       created_timestamp: BigInt(1650903414),
//       creator_address: '0x0685cd85e129ed712401928cbc6619300e0b2f4f',
//       total_supply: BigInt(8145),
//       contract_type: ContractType.ERC721,
//       name: 'PNS',
//       symbol: 'PNS',
//     }),
//   ],
//   'handleERC721'
// );

// Test for correct new NFTs, metadata, Transfer

// Test for correct updated NFTs with transfer

// Correct updated Collections total_supply with increment ERC1155

// Correct update Collections total_supply with state update ERC721
