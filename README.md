# SubQuery - Starter Package

The Starter Package is an example that you can use as a starting point for developing your SubQuery project.
A SubQuery package defines which data The SubQuery will index from the blockchain, and how it will store it.

This SubQuery Ethereum starter project indexes transfers and approvals for the Ethereum Wrapped Ether smart contract. 

Note: If the starter project shows a "failed to fetch blocks", it is highly likely that the endpoint has an issue, often with rate limiting. Please visit https://onfinality.io/ and sign up for a free API key.

## Preparation

#### Environment

- [Typescript](https://www.typescriptlang.org/) are required to compile project and define types.

- Both SubQuery CLI and generated Project have dependencies and require [Node](https://nodejs.org/en/).

#### Install the SubQuery CLI

Install SubQuery CLI globally on your terminal by using NPM:

```
npm install -g @subql/cli
```

Run help to see available commands and usage provide by CLI

```
subql help
```

## Initializing NFT-indexer project

```
yarn install
```
#### Code generation

In order to index your SubQuery project, it is mandatory to build your project first.
Run this command under the project directory.

```
yarn codegen -f <any project-manifest>
```

## Build the project

In order to deploy your SubQuery project to our hosted service, it is mandatory to pack your configuration before upload.
Run pack command from root directory of your project will automatically generate a `your-project-name.tgz` file.

```
yarn build
```

## Indexing and Query

#### Run required systems in docker (this should be wait for the multi-chain manifest)

Under the project directory run following command:

```
docker-compose pull && docker-compose up
```

#### Query the project

Open your browser and head to `http://localhost:3000`.

Finally, you should see a GraphQL playground is showing in the explorer and the schemas that ready to query.

You can try to query with the following code to get a taste of how it works.
```
-Get NFTs for address (all networks)
-Get NFTs for address(one network)
-Get all transfers for address
-Get all transfers for NFT
-Get all NFTs for contract
````

```graphql
query {
        
}
```
