import {Erc1155__factory} from "../../types/contracts";
import { TransferBatchLog, TransferSingleLog } from "../../types/abi-interfaces/Erc1155";
import assert from "assert";
import { handleERC1155batch } from "./handleBatch";
import { BigNumber } from "ethers";

export async function handleERC1155Single(
    event: TransferSingleLog,
): Promise<void> {
    const instance = Erc1155__factory.connect(event.address, api);
    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        const isERC1155 = await instance.supportsInterface('0xd9b67a26');
        if (!isERC1155){
            return;
        }
    } catch (e) {
        return;
    }
    assert(event.args, 'No event args on erc1155');
    const [a,b,c,d,e] = event.args;
    const newArgs: [string, string, string, BigNumber[], BigNumber[]] = [a,b,c,[d],[e]];
    const batchEvent = {
        ...event,
        args: newArgs
    };
    await handleERC1155batch(batchEvent as TransferBatchLog);
}