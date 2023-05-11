import {Address, Collection, ContractType, Network} from "../types";
import {getAddressId, getCollectionId} from "./common";
import {EthereumLog} from "@subql/types-ethereum";

export async function handleAddress(eventAddress: string, networkId: string): Promise<void> {
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
    // return address
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

export async function handleCollection<T>(
    networkId: string,
    event:  T extends EthereumLog ? T : never,
    totalSupply: bigint,
    name: string | null,
    symbol: string | null
): Promise<Collection> {
    const collectionId = getCollectionId(networkId, event.address)
    let collection = await Collection.get(collectionId)

    if (!collection) {
        collection = Collection.create({
            id: collectionId,
            networkId: networkId,
            contract_address: event.address,
            created_block: BigInt(event.blockNumber),
            created_timestamp: event.block.timestamp,
            minter_addressId: event.transaction.from,
            total_supply: totalSupply,
            name: name && name,
            symbol: symbol && symbol
        })
        await collection.save()
    }
    return collection
}