
import { UpgradedLog } from '../types/abi-interfaces/Erc1967';
import { handleDsCreation } from '../utils/utilHandlers';

export async function handleContractUpgrade(event: UpgradedLog): Promise<void> {


// Listens to eip1195, upgrade event

// check if upgraded event is erc721 or erc1155
// i need to abis for this (only for proxy contract, eip1195)
//
// check the contract that is called, not the address in the event
// the rest would be the same as handleTransaction

  // check if the contract that is called

  await handleDsCreation(
    event.address,
    BigInt(event.blockNumber),
    event.block.timestamp, // what if in the case where logs does not exist
    event.transaction.from,
  );

}