import { subqlTest } from '@subql/testing';
import { Collection, ContractType, Network, Nft } from '../types';

subqlTest(
  'testing erc1155BatchTransfer',
  1032058,
  [
    Network.create({
      id: '1285',
    }),
    Collection.create({
      id: '1285-0xdea45e7c6944cb86a268661349e9c013836c79a2',
      networkId: '1285',
      contract_address: '0xdea45e7c6944cb86a268661349e9c013836c79a2',
      created_block: BigInt(1027541),
      created_timestamp: BigInt(1638748242),
      creator_address: '0x05b9b543328d4c797e1eec747efc65d97de542f2',
      total_supply: BigInt(0),
      name: undefined,
      symbol: undefined,
      contract_type: ContractType.ERC1155,
    }),
  ],
  [
    Nft.create({
      id: '1285-0xdea45e7c6944cb86a268661349e9c013836c79a2-22',
      tokenId: '22',
      amount: BigInt(1),
      collectionId: '1285-0xdea45e7c6944cb86a268661349e9c013836c79a2',
      minted_block: BigInt(1032058),
      minted_timestamp: BigInt(1638807066),
      minter_address: '0xdea45e7c6944cb86a268661349e9c013836c79a2',
      current_owner: '0x495e889d1a6ceb447a57dcc1c68410299392380c',
      metadataId: '0x0dc7538203bcfddb',
    }),
  ],
  'handleERC1155Single'
);
