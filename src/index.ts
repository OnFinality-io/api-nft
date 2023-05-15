//Exports all handler functions

import { atob } from "abab";

if (!global.atob) {
    global.atob = atob as any;
}

export * from "./mappings/erc721/index"
export * from "./mappings/erc1155/index"