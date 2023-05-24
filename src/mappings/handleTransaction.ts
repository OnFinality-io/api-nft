import { EthereumTransaction } from '@subql/types-ethereum';
import { Erc1155__factory, Erc721__factory } from '../types/contracts';
import { createERC1155Datasource, createERC721Datasource } from '../types';

export async function handleTransaction(tx: any ):Promise<void> {
  logger.info(`tx ${tx.to}`);
  // if tx has creates on it then that should be the address of a contract creation
  // then we must check if the contract creation is of erc721 or erc1155
  // if it is then we would create a dynamic dataSource for it.

  // then that dynamicDs would query with that given address


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const createsAddress =  tx?.creates.toLowerCase();
  logger.info(`creates=${createsAddress}`);

  if (!createsAddress) {
    return;
  }

  let isErc1155 = false;
  let isErc721 = false;
  const erc1155Instance = Erc1155__factory.connect(createsAddress, api);
  const erc721Instance = Erc721__factory.connect(createsAddress, api);

  try {
    [isErc1155, isErc721]  = await Promise.all([
      erc1155Instance.supportsInterface('0xd9b67a26'),
      erc721Instance.supportsInterface('0x80ac58cd')
    ]);
  } catch (e) {
    logger.warn('not of any interface we want');
    return;
  }

  if (isErc1155) {
    logger.info(`is erc1155, address=${createsAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC1155Datasource({
      address: createsAddress as string,
    });


  }

  if (isErc721) {
    logger.info(`is erc721, address=${createsAddress}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await createERC721Datasource({
      address: createsAddress as string
    });
  }
}