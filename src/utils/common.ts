
export function getCollectionId(networkId: string, address: string): string {
    return Buffer.from(`${networkId}-${address}`, 'utf-8').toString();
}

export function getNftId(collectionId: string, tokenId: string): string {
    return `${collectionId}-${tokenId}`;
}

export function getTransferId(
    networkId: string,
    transactionHash: string,
    logIndex: string,
    batchIndex: number
): string {
    return  Buffer.from(`${transactionHash}-${logIndex}-${batchIndex}-${networkId}`, 'utf-8').toString();
}

export function incrementBigInt(value: bigint): bigint {
    return BigInt(1) + value;
}
