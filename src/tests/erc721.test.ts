import {subqlTest} from "@subql/testing";
import {Address, Collection, ContractType, Network, Nft, Transfers} from "../types";

subqlTest(
    "handleERC721 success",
    13318656 ,
    [
        Network.create({
            id: "1",
            name: "ethereum"
        }),
        Address.create({
            id: '1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            networkId: '1'
        }),
        Collection.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            networkId: "1",
            contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            created_block: BigInt(13318656),
            created_timestamp: BigInt(1632890925),
            minter_addressId: "0xF9E13d8FC6c8F74449a9Cee1088822b817526588",
            total_supply: BigInt(10000),
            // name: "BoredApeYachtClub",
            // symbol: "BAYC"
        }),
        Nft.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            tokenId: "6708",
            amount: BigInt(1),
            collectionId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            minted_block: BigInt(13318656),
            minted_timestamp: BigInt(1632890925),
            minter_addressId: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            current_ownerId: "0x677420671845F3BB7a2f59a0cc530198e1f596e9",
            contract_type: ContractType.ERC721,
            metadata_uri: undefined
        }),
        Transfers.create({
            id: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd-2",
            tokenId: "6708",
            amount: BigInt(1),
            networkId: "1",
            block: BigInt(13318656),
            timestamp: BigInt(1632890925),
            transaction_id: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd",
            nftId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            fromId: "0xF9E13d8FC6c8F74449a9Cee1088822b817526588",
            toId: "0x677420671845F3BB7a2f59a0cc530198e1f596e9"
        })
    ],
    [
        Collection.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            networkId: "1",
            contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            created_block: BigInt(13318656),
            created_timestamp: BigInt(1632890925),
            minter_addressId: "0xF9E13d8FC6c8F74449a9Cee1088822b817526588",
            total_supply: BigInt(10000),
            name: "BoredApeYachtClub",
            symbol: "BAYC"
        }),
        Nft.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            tokenId: "6708",
            amount: BigInt(1),
            collectionId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            minted_block: BigInt(13318656),
            minted_timestamp: BigInt(1632890925),
            minter_addressId: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            current_ownerId: "0x677420671845F3BB7a2f59a0cc530198e1f596e9",
            contract_type: ContractType.ERC721,
            metadata_uri: undefined
        }),
        Transfers.create({
            id: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd-2",
            tokenId: "6708",
            amount: BigInt(1),
            networkId: "1",
            block: BigInt(13318656),
            timestamp: BigInt(1632890925),
            transaction_id: "0x5b143c6613d98c4b189f8ed167e1be4a5de1e771cf1cf34dd4c7f2c84dc261cd",
            nftId: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            fromId: "0xF9E13d8FC6c8F74449a9Cee1088822b817526588",
            toId: "0x677420671845F3BB7a2f59a0cc530198e1f596e9"
        })
    ],
    "handleMoonriverERC721",
)