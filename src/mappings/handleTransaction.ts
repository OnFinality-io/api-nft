import { EthereumTransaction } from '@subql/types-ethereum';
import { Erc1155__factory, Erc721__factory } from '../types/contracts';
import { Collection, createERC1155Datasource, createERC721Datasource } from '../types';
import { handleNetwork } from '../utils/utilHandlers';
import assert from 'assert';
import { getCollectionId } from '../utils/common';

export async function handleTransaction(tx: EthereumTransaction ):Promise<void> {
  logger.info(`tx ${tx.to}`);

  const network = await handleNetwork(chainId);

  // if tx has creates on it then that should be the address of a contract creation
  // then we must check if the contract creation is of erc721 or erc1155
  // if it is then we would create a dynamic dataSource for it.

  // then that dynamicDs would query with that given address

  logger.info(`blockHeight=${tx.blockNumber}`);
  let createsAddress =  (tx as any).creates;


  if (!createsAddress) {
    createsAddress = (await tx.receipt()).contractAddress;

    if (!createsAddress) {
      logger.warn(`creation address is undefined`);
      return;
    }
  }
  const casedCreateAddress = (createsAddress as string).toLowerCase();

  let isErc1155 = false;
  let isErc721 = false;
  const erc1155Instance = Erc1155__factory.connect(casedCreateAddress, api);
  const erc721Instance = Erc721__factory.connect(casedCreateAddress, api);

  try {
    [isErc1155, isErc721]  = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd')
    ]);
  } catch (e) {
    if (!isErc721 && !isErc1155 ) {
      return;
    }
  }



  if (isErc1155) {
    logger.info(`is erc1155, address=${casedCreateAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC1155Datasource({
      address: casedCreateAddress ,
    });

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

  }

  if (isErc721) {
    logger.info(`is erc721, address=${casedCreateAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC721Datasource({
      address: casedCreateAddress
    });


  }
}