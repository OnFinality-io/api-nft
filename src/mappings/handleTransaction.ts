import { EthereumTransaction } from '@subql/types-ethereum';
import { Erc1155__factory, Erc721__factory } from '../types/contracts';
import { Collection, createERC1155Datasource, createERC721Datasource } from '../types';
import { handleNetwork } from '../utils/utilHandlers';
import assert from 'assert';
import { getCollectionId } from '../utils/common';

export async function handleTransaction(tx: EthereumTransaction ):Promise<void> {
  logger.info(`tx ${tx.to}`);
  // if tx has creates on it then that should be the address of a contract creation
  // then we must check if the contract creation is of erc721 or erc1155
  // if it is then we would create a dynamic dataSource for it.

  // then that dynamicDs would query with that given address

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  logger.info(`blockHeight=${tx.blockNumber}`);
  let createsAddress =  (tx as any).creates;


  if (!createsAddress) {

    createsAddress = (await tx.receipt()).contractAddress;
    // logger.info(`receritptpaaaa: ${JSON.stringify(await tx.receipt())}`);
    // logger.info(`receipt: ${createsAddress}`);

    if (!createsAddress) {
      logger.warn(`creation address is undefined`);
      return;
    }
  }
  const casedCreateAddress = (createsAddress as string).toLowerCase();
  // logger.info(`creates=${casedCreateAddress}`);
  // logger.info(`toLowerCase() =${casedCreateAddress.toString().toLowerCase()}`);

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
      // logger.warn(`at address: ${casedCreateAddress}`);
      // logger.warn(`erc721: ${isErc721} || erc1155: ${isErc1155}`);
      // logger.warn('not of any interface we want');
      return;
    }
    // logger.info(`erc721: ${isErc721} || erc1155: ${isErc1155}`);
  }

  // const network = await handleNetwork(chainId);


  if (isErc1155) {
    logger.info(`is erc1155, address=${casedCreateAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC1155Datasource({
      address: casedCreateAddress ,
    });


  }

  if (isErc721) {
    logger.info(`is erc721, address=${casedCreateAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC721Datasource({
      address: casedCreateAddress
    });
  }
}