/*
These addresses are blacklisted as they are proxy contracts that implements multiple interfaces, and does not upgrade to ERC721 or ERC1155
 */
export const blackListedAddresses = [
  '0x969d515486ba6133400ac9c73298586426a090f5', // 592, 1285
  '0xa5bd5c661f373256c0ccfbc628fd52de74f9bb55', // 1284
  '0xa84e233a12b36125a731e1362121d8d4ea030c91', // 1284
  '0xb7af1c82775a63238477852f3b360545514039c0', // 592, 1284
  '0x3009c99d370b780304d2098196f1ebf779a4777a', // 1284
  '0x9f7ea856ba1fb88d35e000c45e75f134a756ac4f', // 1284
  '0x0a6f564c5c9bebd66f1595f1b51d1f3de6ef3b79', // 1284
  '0xbb7eec7e960359f0cf2ef35cd91b120e43876ae8', // 592
  '0xfe8874778f946ac2990a29eba3cfd50760593b2f', // 1284
  '0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e', // 1285
  '0x0e4024950d71f630d710f8523e4e40656a2cd617', // 592
  '0x30510d8a06fb680370547fd42d5bcc127f3930c1', // 592
  '0x0e5971b4809a3eb005fc77980d1260a3e96fa6b9', // 1284
  '0x8ebd92d5e6688dc390433cde329aff379bf12a46', // 1284
  '0x8f7454ac98228f3504bb91ea3d8adafe6406110a', // 1284
  '0x2f2afae1139ce54fefc03593fee8ab2adf4a85a7', // 1284
  '0x2f9db5616fa3fad1ab06cb2c906830ba63d135e3', // 1284
];

/*
Contracts that does not follow the standards
 */

export const bypassContractNfts = [
  '0x07e26ed4ed76ba2bc6f227189f20ceb3bb9c308e', // 592 https://blockscout.com/astar/address/0x07e26ED4ED76ba2Bc6f227189F20ceb3Bb9c308E/transactions#address-tabs <- this contract sets URI within contract constructor, does not have any minted events
  '0x7881b8263a7df9f3d3724f9b8ca9ffc763b96606', // 592 https://blockscout.com/astar/tx/0x4953765ec92b751c951f96fa3a819537a9ee04c057168c6ff7a8208f55423ba2 <- same as above
];

/*
This consists of transactionHashes that are extremely large, in order to improve performance, the db check will no longer be implemented for these transactions
 */
export const erc721BigTransactions = [
  '0xc5122385987f61ec76aad54fe5729b96996ec98cb2676bd46601cbda77ffd41f', // https://blockscout.com/astar/block/1921194/transactions#txs
];
