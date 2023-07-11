import { collectionController } from '../../../utils/utilHandlers';
import { UpgradedLog } from '../../../types/abi-interfaces/Erc1967';

export async function handleContractUpgrade(event: UpgradedLog): Promise<void> {
  // check interface
  // Create collection in accordance to interface
  try {
    await collectionController(event);
  } catch (e: any) {
    if (e?.message === 'Contract does not implement erc165') return;
  }
}
