import {
  TransferBatchLog,
  TransferSingleLog,
} from '../../types/abi-interfaces/Erc1155';
import assert from 'assert';
import { handleERC1155Batch } from './handleBatch';
import { TransferBatchEventObject } from '../../types/contracts/Erc1155';
import { BigNumber } from 'ethers';
import {nonStandardAddresses} from "../../utils/constants";

export async function handleERC1155Single(
  event: TransferSingleLog
): Promise<void> {
  if (nonStandardAddresses.includes(event.address.toLowerCase())) {
    logger.warn(`Contract: ${event.address.toLowerCase()} does not follow erc1155 standards`)
    return
  }
  assert(event.args, `No event args on erc1155 tx: ${event.transactionHash}`);
  const [operator, from, to, id, value] = event.args;
  const newArgs: [string, string, string, BigNumber[], BigNumber[]] = [
    operator,
    from,
    to,
    [id],
    [value],
  ];

  const newNewArgs: [string, string, string, BigNumber[], BigNumber[]] &
    TransferBatchEventObject = Object.assign(newArgs, {
    operator,
    from,
    to,
    ids: [id],
    values: [value],
  });

  const batchEvent = {
    ...event,
    args: newNewArgs,
  };

  await handleERC1155Batch(batchEvent as TransferBatchLog);
}
