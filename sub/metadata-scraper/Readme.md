

## Building

### Flink

`gradle clean build`

This will output to `./build/libs/X.jar`

--http-para 20 --db-schema "d-18143/OnFinality-io/multi-chain-nft-dynamicds" --db-table metadata --interval-sec 10 --batch-size 120 --timeout-sec 30 --ipfs-gateway-private https://onfnft.infura-ipfs.io/ --ipfs-gateway-token *** --ipfs-gateway https://cloudflare-ipfs.com/,https://cf-ipfs.com/,https://gateway.pinata.cloud/,https://ipfs.yt/,https://gateway.ipfs.io/,https://ipfs.io/
