//Exports all handler functions

import { atob } from 'abab';

if (!global.atob) {
  global.atob = atob as any;
}

export * from './tests';
export * from './mappings/erc721';
export * from './mappings/erc1155';
export * from './mappings/handleTransaction';
export * from './mappings/handleContractUpgrade';
