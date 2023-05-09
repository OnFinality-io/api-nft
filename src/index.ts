//Exports all handler functions

import { atob } from "abab";

if (!global.atob) {
    global.atob = atob;
}

export * from "./mappings/erc721/erc721-mapping";
export * from "./mappings/erc1155/erc1155-mapping";

