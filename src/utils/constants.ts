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
  '0x70edb0995662158f96defe1db9b070a237f70d68', // 592 https://blockscout.com/astar/address/0x70EdB0995662158f96defe1DB9b070A237F70D68
  '0x1b30a3b5744e733d8d2f19f0812e3f79152a8777', // 1285 Does not implement erc1155 or erc721 https://moonriver.moonscan.io/address/0x1b30a3b5744e733d8d2f19f0812e3f79152a8777
];

/*
ERC1155 contracts that sets URI before the token is minted
e.g. https://blockscout.com/astar/address/0x2Cbc0538954Dd0b97AA69eac25D2C19D99D8eF2d/logs#address-tabs
 */
export const bypassUnmintedUriTx = [
  '0x7c092ef6fdad566786c632576fcf01ddfa089db0251d85ff02cb69cb2c44580a', // URI set before minting // URI https://blockscout.com/astar/tx/0x7c092ef6fdad566786c632576fcf01ddfa089db0251d85ff02cb69cb2c44580a/logs // MINT https://blockscout.com/astar/tx/0x2e2978827718d3bd79b3f63a4613bf08d670f9be329e5c9bc6c0e772a2b7c9e5
  '0x12211a9663f5ea2b7d46ec7b4ccf4181494cd75b53caafc86ad92926c557f1be', // URI https://blockscout.com/astar/tx/0x12211a9663f5ea2b7d46ec7b4ccf4181494cd75b53caafc86ad92926c557f1be/logs // MINT https://blockscout.com/astar/tx/0x4897682c6ab81f49bf4328cd03364ea3d370c34ad72d75bfe6a5479bb8fb5132
  '0x5ecdc28dfa855efcde4b7831c2730626ddeca98b136f4ade554a8d11a92605ca', // MINT on 3822891 // URI on 3822640 (astar)
  '0x33e3543c25b2e4b337af6c12d301187851af4320b4a6005b9cee4fd9f482beda', // MINT on 3822891 // URI on 3822644 (astar)
  '0x8595f536e8434c6ee46e5fed23599b2804c50f748d12024cffef922979e70a95', // MINT ? // URI on 3145008 (moonriver)
  '0xd1ba35dd5bd51f57aaee96b66e1ac9ed4de2ce8069d4dd16a29f4338ffeadb72', // MINT ? // URI on 3145057 (moonriver)
  '0x02efe3707b36a1d8f302fc0a037229e1ae3e08303715ecaeba90656195ca928e', // MINT ? // URI on 3474293 (moonriver)
  '0x203b16ed2a19155742e2d352c0c708abc73e98215ff9d9dff9e27fdbf32398cd', // MINT 4138589 // URI on 4138335 (astar)
];

/*
This consists of transactionHashes that are extremely large, in order to improve performance, the db check will no longer be implemented for these transactions
 */
export const erc721BigTransactions = [
  '0xc5122385987f61ec76aad54fe5729b96996ec98cb2676bd46601cbda77ffd41f', // https://blockscout.com/astar/block/1921194/transactions#txs
  '0x4ce0989450d3520d514254166c245d2c290d2b2039f42cb12be86e74ec28e866', // https://blockscout.com/astar/tx/0x4ce0989450d3520d514254166c245d2c290d2b2039f42cb12be86e74ec28e866
];
