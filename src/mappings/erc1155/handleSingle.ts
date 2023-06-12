import {
  TransferBatchLog,
  TransferSingleLog,
} from '../../types/abi-interfaces/Erc1155';
import assert from 'assert';
import { handleERC1155batch } from './handleBatch';
import { TransferBatchEventObject } from '../../types/contracts/Erc1155';
import { BigNumber } from 'ethers';

export async function handleERC1155Single(
  event: TransferSingleLog
): Promise<void> {
  assert(event.args, 'No event args on erc1155');
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

  await handleERC1155batch(batchEvent as TransferBatchLog);
}
