import { EthereumTransaction } from '@subql/types-ethereum';
import { handleDsCreation } from '../utils/utilHandlers';

export async function handleTransaction(
  tx: EthereumTransaction
): Promise<void> {
  // if tx has creates on it then that should be the address of a contract creation
  // then we must check if the contract creation is of erc721 or erc1155
  // if it is then we would create a dynamic dataSource for it.
  // then that dynamicDs would query with that given address

  let createsAddress = (tx as any).creates;

  if (!createsAddress) {
    try {
      createsAddress = (await tx.receipt()).contractAddress;
    } catch (e) {
      logger.warn(
        `failed to get contractAddress on block=${tx.blockNumber} tx=${tx.hash}`
      );
    }

    if (!createsAddress) {
      logger.warn('No address found');
      return;
    }
  }

  await handleDsCreation(
    (createsAddress as string).toLowerCase(),
    BigInt(tx.blockNumber),
    tx.blockTimestamp,
    tx.from
  );
}
