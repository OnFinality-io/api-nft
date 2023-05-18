import {subqlTest} from "@subql/testing";
import { Collection, ContractType, Network, Nft, Transfer } from "../types";

subqlTest(
    "test erc1155",
  3556807 ,
    [
      Network.create({
          id: "1284"
      }),
        Collection.create({
            id: "",
            networkId: "",
            contract_address: "",
            created_block: BigInt(0),
            created_timestamp: BigInt(0),
            creator_address: "",
            total_supply: BigInt(0),
            name: "",
            symbol: ""
        }),
        Nft.create({
            id: "",
            tokenId: "",
            amount: BigInt(0),
            collectionId: "",
            minted_block: BigInt(0),
            minted_timestamp: BigInt(0),
            minter_address: "",
            current_owner: "",
            contract_type: ContractType.ERC721,
        }),
        Transfer.create({
            id: "",
            tokenId: "",
            amount: BigInt(0),
            networkId: "",
            block: BigInt(0),
            timestamp: BigInt(0),
            transaction_hash: "",
            nftId: "",
            from: "",
            to: ""
        })
    ],
    [
        Collection.create({
            id: "1284-0xF37626E2284742305858052615E94B380B23B3b7",
            networkId: "1284",
            contract_address: "0xF37626E2284742305858052615E94B380B23B3b7",
            created_block: BigInt(3556807),
            created_timestamp: BigInt(1684026600),
            creator_address: "0x9d3bcf6095791216cb9e39acb3c59b53fdc3b717",
            total_supply: BigInt(4),
            // name: null,
            // symbol: "POLKI"
        }),
        Nft.create({
            id: "1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6708",
            tokenId: "3",
            amount: BigInt(30),
            collectionId: "1284-0xF37626E2284742305858052615E94B380B23B3b7",
            minted_block: BigInt(3556807),
            minted_timestamp: BigInt(1684026600),
            minter_address: "0xF37626E2284742305858052615E94B380B23B3b7",
            current_owner: "0xEc7D2c7D082c196e2704d9cFc149CacbF8463380",
            contract_type: ContractType.ERC1155,
            metadata_uri: "ipfs://QmSLWoCPAeSxXhPg8TLf3TyH8Kusj7u8ULow2NNgCRheAH/3"
        }),
        Transfer.create({
            id: "0x47bbf5ebedcd34403c215c52ddfd9a2c5b55bc9a7a8428bd2c9c8ffd0b1f7a43-1284",
            tokenId: "3",
            amount: BigInt(30),
            networkId: "1284",
            block: BigInt(3556807),
            timestamp: BigInt(1684026600),
            transaction_hash: "0x47bbf5ebedcd34403c215c52ddfd9a2c5b55bc9a7a8428bd2c9c8ffd0b1f7a43",
            nftId: "1284-0xF37626E2284742305858052615E94B380B23B3b7-3",
            from: "0x9D3BCf6095791216CB9e39aCB3C59B53Fdc3B717",
            to: "0xEc7D2c7D082c196e2704d9cFc149CacbF8463380"
        })
    ],
    "handleERC1155Single",
);