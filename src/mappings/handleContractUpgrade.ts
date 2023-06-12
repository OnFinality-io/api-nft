import { UpgradedLog } from '../types/abi-interfaces/Erc1967';
import { handleDsCreation } from '../utils/utilHandlers';

export async function handleContractUpgrade(event: UpgradedLog): Promise<void> {
  // Listens to eip1195, upgrade && beaconUpgrade events

  await handleDsCreation(
    event.address.toLowerCase(),
    BigInt(event.blockNumber),
    event.block.timestamp,
    event.transaction.from
  );
}
