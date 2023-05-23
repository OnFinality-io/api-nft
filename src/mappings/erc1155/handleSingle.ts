import assert from 'assert';
import { handleERC1155batch } from './handleBatch';
import { BigNumber } from 'ethers';
import { FrontierEvmEvent} from "@subql/frontier-evm-processor";
import {TransferBatchEvent, TransferSingleEvent} from "../../types/contracts/Erc1155";

export async function handleERC1155Single(
    event: FrontierEvmEvent<TransferSingleEvent['args']>
): Promise<void> {
    logger.info('hit erc1155 single')

    assert(event.args, 'No event args on erc1155');
    const [operator, from, to, id, value] = event.args;
    const newArgs: [string, string, string, BigNumber[], BigNumber[]] = [
        operator,
        from,
        to,
        [id],
        [value],
    ];

    const newNewArgs: [string, string, string, BigNumber[], BigNumber[]] & { values: BigNumber[]; ids: BigNumber[]; from: string; to: string; operator: string } = Object.assign(newArgs, {
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

    await handleERC1155batch(batchEvent as FrontierEvmEvent<TransferBatchEvent['args']>);
}
