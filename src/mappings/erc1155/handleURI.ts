import {URILog} from "../../types/abi-interfaces/Erc1155";
import {Erc1155__factory} from "../../types/contracts";
import {Nft} from "../../types";
import {getCollectionId, getNftId} from "../../utils/common";
import {handleNetwork} from "../../utils/utilHandlers";
import {enumNetwork} from "../../utils/network-enum";
import assert from "assert";


export async function handleERC1155Uri(
    event: URILog,
    _network: enumNetwork
): Promise<void> {
    assert(event.args, 'No event args')

    let isERC1155 = false
    let instance = Erc1155__factory.connect(event.address, api);

    let network = await handleNetwork(_network.chainId, _network.name)

    try {
        // https://eips.ethereum.org/EIPS/eip-1155#abstract
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155} uri`)
    } catch (e) {
        return;
    }

    const collectionId = getCollectionId(network.id, event.address)
    const nftId = getNftId(collectionId, event && event.args.id.toString())

    let nft = await Nft.get(nftId)

    if (!nft) {
        logger.warn(`NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`)
        return
    }

    nft.metadata_uri = event.args.value
    await nft.save()
}