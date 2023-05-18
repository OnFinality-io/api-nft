import {subqlTest} from "@subql/testing";
import { Collection, ContractType, Network, Nft, Transfer } from "../types";

subqlTest(
    "handleERC721 success",
    13318656 ,
    [
      Network.create({
          id: "1284"
      }),
        Collection.create({
            id: "1284-0xEE36C5225bd868Be5Ed329DC62F4B3d09c62c320",
            networkId: "1284",
            contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            created_block: BigInt(171725),
            created_timestamp: BigInt(1641903660),
            creator_address: "0xcc5433cc33f9d1618cec56c25d26653680f41ae1",
            total_supply: BigInt(96),
            name: "Polkis",
            symbol: "POLKI"
        }),
        Nft.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            tokenId: "6708",
            amount: BigInt(1),
            collectionId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            minted_block: BigInt(13318656),
            minted_timestamp: BigInt(1632890925),
            minter_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            current_owner: "0x677420671845F3BB7a2f59a0cc530198e1f596e9",
            contract_type: ContractType.ERC721,
            metadata_uri: undefined
        }),
        Transfer.create({
            id: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd-2",
            tokenId: "6708",
            amount: BigInt(1),
            networkId: "1",
            block: BigInt(13318656),
            timestamp: BigInt(1632890925),
            transaction_hash: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd",
            nftId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            from: "0xF9E13d8FC6c8F74449a9Cee1088822b817526588",
            to: "0x677420671845F3BB7a2f59a0cc530198e1f596e9"
        })
    ],
    [
        Collection.create({
            id: "1284-0xEE36C5225bd868Be5Ed329DC62F4B3d09c62c320",
            networkId: "1284",
            contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            created_block: BigInt(171725),
            created_timestamp: BigInt(1641903660),
            creator_address: "0xcc5433cc33f9d1618cec56c25d26653680f41ae1",
            total_supply: BigInt(96),
            name: "Polkis",
            symbol: "POLKI"
        }),
        Nft.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            tokenId: "1",
            amount: BigInt(1),
            collectionId: "1284-0xEE36C5225bd868Be5Ed329DC62F4B3d09c62c320-1",
            minted_block: BigInt(171725),
            minted_timestamp: BigInt(1641903660),
            minter_address: "0xcc5433cc33f9d1618cec56c25d26653680f41ae1",
            current_owner: "0xcC5433cC33F9d1618CeC56C25d26653680f41Ae1",
            contract_type: ContractType.ERC721,
            metadata_uri: "https://moonarines.mypinata.cloud/ipfs/QmUNQ9iB9PCGWwNYZWxAfn81GG8dfW1QC1VE2tgQCGBb36/1.json"
        }),
        Transfer.create({
            id: "0xc1ba07ebaae73b5aca4a3482e793d89524f57f925501a32c5aaee76c3acc324c-1284",
            tokenId: "2",
            amount: BigInt(1),
            networkId: "1284",
            block: BigInt(171725),
            timestamp: BigInt(1641903660),
            transaction_hash: "0xc1ba07ebaae73b5aca4a3482e793d89524f57f925501a32c5aaee76c3acc324c",
            nftId: "1284-0xEE36C5225bd868Be5Ed329DC62F4B3d09c62c320-2",
            from: "0x0000000000000000000000000000000000000000",
            to: "0xcC5433cC33F9d1618CeC56C25d26653680f41Ae1"
        })
    ],
    "handleMoonriverERC721",
);