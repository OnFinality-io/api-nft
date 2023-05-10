//Exports all handler functions

import { atob } from "abab";

if (!global.atob) {
    global.atob = atob;
}

export * from "./mappings/erc721/erc721-mapping";

export * from "./mappings/erc1155/handleURI";
export * from "./mappings/erc1155/handleBatch";
export * from "./mappings/erc1155/handleSingle";

