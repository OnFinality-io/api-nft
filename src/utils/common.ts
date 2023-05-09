import {BigNumber} from "ethers";

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

// export function incrementBigInt(num: bigInt): bigInt {
//     return BigNumber.from(num).add(1).toBigInt()
// }