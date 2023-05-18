import { Erc1155__factory } from '../../types/contracts';
import {
  TransferBatchLog,
  TransferSingleLog,
} from '../../types/abi-interfaces/Erc1155';
import assert from 'assert';
import { handleERC1155batch } from './handleBatch';
import { BigNumber } from 'ethers';
import { TransferBatchEventObject } from '../../types/contracts/Erc1155';

export async function handleERC1155Single(
  event: TransferSingleLog
): Promise<void> {
  const instance = Erc1155__factory.connect(event.address, api);
  try {
    // https://eips.ethereum.org/EIPS/eip-1155#abstract
    const isERC1155 = await instance.supportsInterface('0xd9b67a26');
    if (!isERC1155) {
      return;
    }
  } catch (e) {
    return;
  }
  assert(event.args, 'No event args on erc1155');
  // const [a,b,c,d,e] = event.args;
  const [operator, from, to, id, value] = event.args;
  const newArgs: [string, string, string, BigNumber[], BigNumber[]] = [
    operator,
    from,
    to,
    [id],
    [value],
  ];


  // const x:[string, string, string, BigNumber[], BigNumber[]]& TransferBatchEventObject = { operator, from, to, ids: [id], values: [value] as BigNumber[] };

  // const newArgs = Object.assign(event.args, {a,b,c, ids: [d] ,values: [e]});
  // const newArgs = Object.assign(...event.args, ...x);
  // const newArgs: TransferBatchLog = { ...event, args : x };

  logger.info(`old: ${JSON.stringify(event.args)}`);
  logger.info(`new: ${JSON.stringify(newArgs)}`);

  const batchEvent = {
    ...event,
    args: newArgs,
  };
  await handleERC1155batch(batchEvent as TransferBatchLog);
}
