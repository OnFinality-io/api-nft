import { Collection, ContractType, Nft, Transfers } from "../../types";
import {Erc1155__factory} from "../../types/contracts";
import { getCollectionId, getNftId, getTransferId, incrementBigInt } from "../../utils/common";
import { TransferBatchLog, TransferSingleLog } from "../../types/abi-interfaces/Erc1155";
import { handle1155Collections, handle1155Nfts, handleNetwork } from "../../utils/utilHandlers";
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
            return
        }
    } catch (e) {
        return;
    }
    // assert(event.args, 'No event args on erc1155')
    // const newArgs =[...event.args]
    // const newArg_3: BigNumber[] = [BigNumber.from(event.args[3])]
    // const newArg_4: BigNumber[] = [BigNumber.from(event.args[4])]
    //
    // newArgs[3] = newArg_3
    // newArgs[4] = newArg_4
    //
    // const batchEvent = {
    //     ...event,
    //     args:  newArgs
    // };
    // logger.info(`org: ${JSON.stringify(event.args)}`)
    // logger.info(`new: ${JSON.stringify(batchEvent.args)}`)
    // await handleERC1155batch(batchEvent as unknown as TransferBatchLog)
}