import {handleERC1155Uri} from "../erc1155/handleURI";
import {TransferBatchLog, TransferSingleLog, URILog} from "../../types/abi-interfaces/Erc1155";
import {handleERC1155single} from "../erc1155/handleSingle";
import {handleERC1155batch} from "../erc1155/handleBatch";
import {TransferLog} from "../../types/abi-interfaces/Erc721";
import {handleERC721} from "../erc721/erc721-mapping";


export async function handleMoonbeamERC1155Uri (event: URILog): Promise<void> {
    await handleERC1155Uri(event)
}

export async function handleMoonbeamERC1155Single (event: TransferSingleLog): Promise<void> {
    await handleERC1155single(event)
}

export async function handleMoonbeamERC1155Batch (event: TransferBatchLog): Promise<void> {
    await handleERC1155batch(event)
}

export async function handleMoonbeamERC721 (event: TransferLog): Promise<void> {
    await handleERC721(event)
}