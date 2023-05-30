import { EthereumTransaction } from '@subql/types-ethereum';
import { Erc1155__factory, Erc721__factory } from '../types/contracts';
import { createERC1155Datasource, createERC721Datasource } from '../types';
import { handleDsCreation } from '../utils/utilHandlers';

export async function handleTransaction(tx: EthereumTransaction ):Promise<void> {
  // const network = await handleNetwork(chainId);

  // if tx has creates on it then that should be the address of a contract creation
  // then we must check if the contract creation is of erc721 or erc1155
  // if it is then we would create a dynamic dataSource for it.

  // then that dynamicDs would query with that given address

  logger.info(`contract creation at blockHeight=${tx.blockNumber}`);
  // sometimes it would not follow standards
  let createsAddress =  (tx as any).creates;


  if (!createsAddress) {
    try {
      createsAddress = (await tx.receipt()).contractAddress;
    } catch (e) {
      logger.warn(`failed to get contractAddress on block=${tx.blockNumber} tx=${tx.hash}`);
    }

    if (!createsAddress) {
      logger.warn(`creation address is undefined`);
      return;
    }
  }
  const casedCreateAddress = (createsAddress as string).toLowerCase();

  const erc1155Instance = Erc1155__factory.connect(casedCreateAddress, api);
  const erc721Instance = Erc721__factory.connect(casedCreateAddress, api);

  // try {
  //   [isErc1155, isErc721]  = await Promise.all([
  //     erc1155Instance.supportsInterface('0xd9b67a26'),
  //     erc721Instance.supportsInterface('0x80ac58cd')
  //   ]);
  // } catch (e) {
  //   if (!isErc721 && !isErc1155 ) {
  //     return;
  //   }
  // }

  await handleDsCreation(
    casedCreateAddress,
    BigInt(tx.blockNumber),
    tx.blockTimestamp, // what if in the case where logs does not exist
    tx.from,
    erc1155Instance,
    erc721Instance
  );
  // if (isErc1155) {
  //   logger.info(`is erc1155, address=${casedCreateAddress}`);
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //   await createERC1155Datasource({
  //     address: casedCreateAddress ,
  //   });

    // need to add timestamp to tx

    // const collectionId = getCollectionId(chainId, casedCreateAddress);
    // // let collection = await Collection.get(collectionId);
    //
    // const collection = Collection.create({
    //   id: collectionId,
    //   networkId: chainId,
    //   contract_address: casedCreateAddress,
    //   created_block: BigInt(tx.blockNumber),
    //   created_timestamp: tx.timestamp,
    //   creator_address: event.transaction.from,
    //   total_supply: totalSupply,
    // });
    //
    // await collection.save();

  // }

  // if (isErc721) {
  //   logger.info(`is erc721, address=${casedCreateAddress}`);
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //   await createERC721Datasource({
  //     address: casedCreateAddress
  //   });
  //
  //
  // }
}