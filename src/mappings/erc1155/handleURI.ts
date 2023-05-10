import {URILog} from "../../types/abi-interfaces/Erc1155";
import {Erc1155__factory} from "../../types/contracts";
import {Nft} from "../../types";
import {getCollectionId, getNftId, handleNetwork} from "../../utils/common";


export async function handleERC1155Uri(event: URILog): Promise<void> {

    let isERC1155 = false
    let instance = Erc1155__factory.connect(event.address, api);

    let network = await handleNetwork("1", "ethereum")


    try {
        isERC1155 = await instance.supportsInterface('0xd9b67a26');

        if (!isERC1155){
            return
        }
        logger.info(`isERC1155 ${isERC1155} uri`)
    } catch (e) {
        return;
    }

    const collectionId = getCollectionId(network.id, event.address)
    const nftId = getNftId(collectionId, event.args.id.toString())

    let nft = await Nft.get(nftId)

    if (!nft) {
        logger.warn(`NFT: ${nftId} does not exist in db, tx: ${event.transactionHash}`)
        return
    }

    nft.metadata_uri = event.args.value
    await nft.save().then(()=>{
        logger.info(`updated nft: ${nft.id}`)
    })
}