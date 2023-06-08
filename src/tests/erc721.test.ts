import { subqlTest } from '@subql/testing';
import { Collection, ContractType } from '../types';

subqlTest(
  'test collections entity',
  218985,
  [],
  [
    Collection.create({
      id: '592-0xbb7eec7e960359f0cf2ef35cd91b120e43876ae8',
      networkId: '592',
      contract_address: '0xbb7eec7e960359f0cf2ef35cd91b120e43876ae8',
      created_block: BigInt(218985),
      created_timestamp: BigInt(1642483296),
      creator_address: '0xa4849f1d96b26066f9c631fcdc8f1457d27fb5ec',
      total_supply: BigInt(0),
      contract_type: ContractType.ERC1155,
      name: undefined,
      symbol: undefined,
    }),
  ],
  'handleTransaction'
);
