import {Address, AnyJson, Network} from "../types";
import {BigNumber, BigNumberish} from "ethers";

export function getCollectionId(
    networkId: string,
    address: string
): string{
    return `${networkId}-${address}`
}

export function getNftId(
    collectionId: string,
    tokenId: string
):string {
    return `${collectionId}-${tokenId}`
}

export function getTransferId(
    transactionHash: string,
    transactionIndex: number
): string {
    return `${transactionHash}-${transactionIndex}`
}

export function getAddressId(
    networkId: string,
    address: string
): string {
    return `${networkId}-${address}`
}

export function extractIpfsHash(metadataUri: string): string {
    const hashStartIndex = "ipfs://".length
    return metadataUri.slice(hashStartIndex);
}

export async function decodeMetadata(metadataUri): Promise<AnyJson> {
    const metadataHost = 'https://unauthipfs.subquery.network/ipfs/api/v0/cat?arg=';

    if (metadataUri.startsWith("ipfs://")) {
        const metadataCID = extractIpfsHash(metadataUri)
        const url = `${metadataHost}${metadataCID}`
        try {
            const response = await fetch(
                url,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            return (await response.json()) as AnyJson
        } catch (e) {
            logger.error(`Failed to fetch metadata from ipfs URI: ${metadataUri}, ${e.message}`)
        }
    }
    try {
        return (await fetch(metadataUri)) as AnyJson
    } catch (e) {
        logger.error(`Failed to fetch metadata from URI: ${metadataUri}, ${e.message}`)
    }
}

export function incrementBigInt(value: bigint): bigint {
    return BigInt(1) + value
}
