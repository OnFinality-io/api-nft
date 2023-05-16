import {Network} from "../types";

export async function handleNetwork (id: string): Promise<Network> {
    let network = await Network.get(id)
    if (!network) {
        network = Network.create({
            id,
        })
        await network.save()
    }
    return network
}