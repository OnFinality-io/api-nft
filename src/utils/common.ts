import {AnyJson} from "../types";
import {FetchError} from "node-fetch";

export function getCollectionId(
    networkId: string,
    address: string
): string{
    return `${networkId}-${address}`;
}

export function getNftId(
    collectionId: string,
    tokenId: string
):string {
    return `${collectionId}-${tokenId}`;
}

export function getTransferId(
    networkId: string,
    transactionHash: string
): string {
    return `${transactionHash}-${networkId}`;
}


export function extractIpfsHash(metadataUri: string): string {
    const hashStartIndex = "ipfs://".length;
    return metadataUri.slice(hashStartIndex);
}

export async function decodeMetadata(metadataUri: string): Promise<AnyJson | undefined> {
    const metadataHost = 'https://unauthipfs.subquery.network/ipfs/api/v0/cat?arg=';

    if (metadataUri.startsWith("ipfs://")) {
        const metadataCID = extractIpfsHash(metadataUri);
        const url = `${metadataHost}${metadataCID}`;
        try {
            const response = await fetch(
                url,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return (await response.json()) as AnyJson;
        } catch (e: unknown) {
            const fetchError: FetchError = e as FetchError;
            logger.error(`Failed to fetch metadata from ipfs URI: ${metadataUri}, ${fetchError.message}`);
        }
    }
    try {
        return (await fetch(metadataUri)) as AnyJson;
    } catch (e) {
        const fetchError: FetchError = e as FetchError;
        logger.error(`Failed to fetch metadata from URI: ${metadataUri}, ${fetchError.message}`);
    }
}

export function incrementBigInt(value: bigint): bigint {
    return BigInt(1) + value;
}
