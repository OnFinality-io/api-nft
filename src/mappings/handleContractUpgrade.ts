
// Listens to eip1195, upgrade event

// check if upgraded event is erc721 or erc1155
// i need to abis for this (only for proxy contract, eip1195)
//
// check the contract that is called, not the address in the event
// the rest would be the same as handleTransaction