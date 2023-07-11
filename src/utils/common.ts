import { AnyJson } from '../types';
import { FetchError } from 'node-fetch';
import { blake2AsHex } from '@polkadot/util-crypto';

export function getCollectionId(networkId: string, address: string): string {
  return `${networkId}-${address.toLowerCase()}`;
}

export function getNftId(collectionId: string, tokenId: string): string {
  return `${collectionId}-${tokenId}`;
}

export function getAddressId(address: string, creator: string): string {
  return `${address.toLowerCase()}-${creator.toLowerCase()}`;
}

export function getTransferId(
  networkId: string,
  transactionHash: string,
  logIndex: string,
  batchIndex: number
): string {
  return `${transactionHash}-${logIndex}-${batchIndex}-${networkId}`;
}

export function getBlacklistId(
  networkId: string,
  contractAddress: string
): string {
  return `${networkId}-${contractAddress.toLowerCase()}`;
}

export function hashId(id: string): string {
  // Postgres identifier limit is 63 bytes (chars)
  return blake2AsHex(id, 64).substring(0, 63);
}

export function incrementBigInt(value: bigint): bigint {
  return BigInt(1) + value;
}
