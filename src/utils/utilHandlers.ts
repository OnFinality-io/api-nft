import { Collection, Network} from "../types";
import { getCollectionId} from "./common";
import {EthereumLog} from "@subql/types-ethereum";

export async function handleNetwork (id: string): Promise<Network> {
    let network = await Network.get(id)

    if (!network) {
        network = Network.create({
            id,
        })
        logger.info(`new network: ${id} has been added`)
        await network.save()
    }
    return network
}

export async function handleCollection<T>(
    networkId: string,
    event:  T extends EthereumLog ? T : never,
    totalSupply: bigint,
    // name: string | undefined,
    // symbol: string | undefined
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
            creator_address: event.transaction.from,
            total_supply: totalSupply,
            name: "name",
            symbol: "symbol"
        })
        await collection.save()
    }
    return collection
}