import { Collection, ContractType, Nft, Transfer } from '../../types';
import { Erc721__factory } from '../../types/contracts';
import { TransferLog } from '../../types/abi-interfaces/Erc721';
import { getCollectionId, getNftId, getTransferId, incrementBigInt } from '../../utils/common';
import { handleAddress, handleMetadata } from '../../utils/utilHandlers';
import assert from 'assert';

export async function handleERC721(event: TransferLog): Promise<void> {
  const instance = Erc721__factory.connect(event.address, api);

  // there should be an interface check to see if the transaction is of the correct interface


  // this is still needed, when the dynamic DS is created, it is looking for transfers
  // it is possible that there is a transfer event on the address that is not the desrired erc ?
  // let isErc721 = false;
  // try {
  //   isErc721 = await instance.supportsInterface('0x80ac58cd');
  // } catch (e) {
  //   return;
  // }
  //
  // if (!isErc721) {
  //   logger.warn(`not a erc721 transfer, address: ${event.address.toLowerCase()}`);
  //   return;
  // }

  // If collection is already in db, no need to check state.
  const collectionId = getCollectionId(chainId, event.address);
  const collection = await Collection.get(collectionId);

  // test purpose only
  // if (!collection) {
  //   logger.warn(`collection missing on ${collectionId}`);
  //   return;
  // }
  assert(collection, `Missing collection: ${collectionId}`);
  assert(event.args, 'No event args on erc721');

  const nftId = getNftId(collection.id, event.args.tokenId.toString());
  let nft = await Nft.get(nftId);

  if (!nft) {
    let metadataUri;
    try {
      // metadata possibly undefined
      // nft can share same metadata
      // if collection.name and symbol exist, meaning there is metadata on this contract
      metadataUri = collection.name || collection.symbol
        ? await instance.tokenURI(event.args.tokenId)
        : undefined;
    } catch (e) {}

    if (metadataUri){
      await handleMetadata(metadataUri);
    }

    nft = Nft.create({
      id: nftId,
      tokenId: event.args.tokenId.toString(),
      amount: BigInt(1),
      collectionId: collection.id,
      minted_block: BigInt(event.blockNumber),
      minted_timestamp: event.block.timestamp,
      minter_address: event.transaction.from.toLowerCase(),
      current_owner: event.args.to.toLowerCase(),
      contract_type: ContractType.ERC721,
      metadataId: metadataUri,
    });

    try {
      collection.total_supply = (await instance.totalSupply()).toBigInt();
    } catch (e) {
      collection.total_supply = incrementBigInt(collection.total_supply);
    }

    await Promise.all([collection.save(), nft.save()]);
  }

  const transferId = getTransferId(
    chainId,
    event.transactionHash,
    event.logIndex.toString(),
    0
  );

  const transfer = Transfer.create({
    id: transferId,
    tokenId: event.args.tokenId.toString(),
    amount: BigInt(1),
    networkId: chainId,
    block: BigInt(event.blockNumber),
    timestamp: event.block.timestamp,
    transaction_hash: event.transactionHash,
    nftId: nft.id,
    from: event.args.from.toLowerCase(),
    to: event.args.to.toLowerCase(),
  });

  await Promise.all([
    transfer.save(),
    handleAddress(event.args.to, event.transaction.from),
    handleAddress(event.args.from, event.transaction.from)
  ]);
}