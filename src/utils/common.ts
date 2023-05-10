import {Address, Network} from "../types";
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

export async function handleNetwork (id: string, name): Promise<Network> {
    let network = await Network.get(id)

    if (!network) {
        network = Network.create({
            id,
            name
        })
        logger.info(`new network: ${name} has been added`)
        await network.save()
    }
    return network
}

export async function handleAddress(eventAddress: string, networkId: string): Promise<Address> {
    const addressId = getAddressId(networkId, eventAddress)
    let address = await Address.get(addressId)

    if (!address) {
        address = Address.create({
            id: addressId,
            address: eventAddress,
            networkId: networkId
        })
        await address.save()
    }
    return address
}

export function incrementBigInt(value: bigint): bigint {
    logger.info(value)
    return BigNumber.from(value).add(1).toBigInt()
}
