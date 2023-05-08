// import { Approval, Transaction } from "../types";
import {
    ApproveTransaction,
    TransferLog,
} from "../types/abi-interfaces/Erc721";
// import {Contract, Owner, Token, Transfer} from "../types";
import {EthereumTransaction} from "@subql/types-ethereum";
import {TransferEvent} from "../types/contracts/Erc721";
import {Erc721__factory} from "../types/contracts";
import {BigNumber} from "ethers";

// export async function handleLog(log: TransferLog): Promise<void> {
//   logger.info(`New transfer transaction log at block ${log.blockNumber}`);
//   const transaction = Transaction.create({
//     id: log.transactionHash,
//     txHash: log.transactionHash,
//     blockHeight: BigInt(log.blockNumber),
//     to: log.args.to,
//     from: log.args.from,
//     value: log.args.value.toBigInt(),
//     contractAddress: log.address,
//   });
//
//   await transaction.save();
// }

export async function handleTransaction(event: TransferEvent): Promise<void> {
    logger.info(`Transfer detected. From: ${event.args.from} | To: ${event.args.to} | TokenID: ${event.args.tokenId}`);

    // get Network
    // if Null then create network
    // newNetwork = network.create({ event.network })

    let previousOwner = await Owner.get(event.args.from);

    let newOwner = await Owner.get(event.args.to);

    let token = await Token.get(event.args.tokenId.toString());

    let transferId = event.transactionHash.concat(':'.concat(event.transactionIndex.toString()))

    let transfer = await Transfer.get(transferId)
    let contract = await Contract.get(event.address);

    let instance = Erc721__factory.connect(event.address, api);

    if (previousOwner == null) {
        previousOwner = Owner.create({
            id: event.args.from,
            balance: BigInt(0)
        });
    } else {
        if (previousOwner.balance > BigInt(0)) {
            previousOwner.balance = BigNumber.from(previousOwner.balance).sub(1).toBigInt()
            logger.info(`sub: ${previousOwner.balance}`)
        }
    }

    if (newOwner == null) {
        newOwner = Owner.create({
            id: event.args.to,
            balance: BigInt(1)
        });
        // newOwner.balance = BigInt(1);
    } else {
        // let prevBalance = newOwner.balance;
        // newOwner.balance = BigNumber.from(prevBalance).add(1).toBigInt();
        // logger.info(`newOwner: ${newOwner}`)
        logger.info(`add before ${newOwner.balance}`)
        newOwner.balance = BigNumber.from(newOwner.balance).add(1).toBigInt();
        logger.info(`add after ${newOwner.balance}`)
    }

    if (token == null) {
        token = Token.create({
            id: event.args.tokenId.toString(),
            contractId: event.address
        });

        let uri = await instance.tokenURI(event.args.tokenId);

        if (uri != null) {
            token.uri = uri;
        }
    }

    token.ownerId = event.args.to

    if (transfer == null) {
        transfer = Transfer.create({
            id: transferId,
            tokenId: event.args.tokenId.toString(),
            fromId: event.args.from,
            toId: event.args.to,
            block: BigInt(event.blockNumber),
            timestamp: BigInt(69),
            transactionHash: event.transactionHash
        });
    }

    if (contract == null) {
        contract = Contract.create({id: event.address});
    }

    let name = await instance.name();
    if (name != null) {
        contract.name = name;
    }

    let symbol = await instance.symbol();
    if (symbol != null) {
        contract.symbol = symbol;
    }

    let totalSupply = await instance.totalSupply();
    if (totalSupply != null) {
        contract.totalSupply = totalSupply.toBigInt();
    }

    await Promise.all([
            previousOwner.save(),
            newOwner.save(),
            token.save(),
            contract.save(),
            transfer.save(),
        ]
    ).then(()=> {
        logger.info("saved !!")
    })
}

// subqlTest(
//     "handleTransaction",
//
//
// )
