
// Listens to eip1195, upgrade event

// check if upgraded event is erc721 or erc1155
// i need to abis for this (only for proxy contract, eip1195)
//
// check the contract that is called, not the address in the event
// the rest would be the same as handleTransaction

import { UpgradedLog } from '../types/abi-interfaces/Erc1967';
import { Erc1155__factory, Erc721__factory } from '../types/contracts';
import { handleDsCreation } from '../utils/utilHandlers';

export async function handleContractUpgrade(event: UpgradedLog): Promise<void> {

  let isErc1155 = false;
  let isErc721 = false;

  // check if the contract that is called
  const erc1155Instance = Erc1155__factory.connect(event.address, api);
  const erc721Instance = Erc721__factory.connect(event.address, api);

  try {
    [isErc1155, isErc721]  = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd')
    ]);
  } catch (e) {
    if (!isErc721 && !isErc1155 ) {
      return;
    }
  }
  const casedCreateAddress = event.address.toLowerCase();

  await handleDsCreation(
    casedCreateAddress,
    BigInt(event.blockNumber),
    event.block.timestamp, // what if in the case where logs does not exist
    event.transaction.from,
    erc1155Instance,
    erc721Instance
  );

}