/*
These addresses are blacklisted as they are proxy contracts that implements multiple interfaces, and does not upgrade to ERC721 or ERC1155
 */

// Get list from db
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
];
