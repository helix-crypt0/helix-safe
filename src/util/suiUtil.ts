import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1PublicKey } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1PublicKey } from "@mysten/sui/keypairs/secp256r1";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { ZkLoginPublicIdentifier } from "@mysten/sui/zklogin";
import { PublicKey } from "@mysten/sui/cryptography";
import { formatAddress, fromB64, MIST_PER_SUI } from "@mysten/sui/utils";
import {
    SnackbarState,
    SuiNetworks,
    HelixSafeApiResponse,
} from "@src/interfaces/interfaces";
import {
    Transaction,
    TransactionArgument,
    TransactionResult,
} from "@mysten/sui/transactions";
import { Dispatch, SetStateAction } from "react";
import { SuiClient, SuiMoveNormalizedType } from "@mysten/sui/client";
import { TXN_BLOCK_RESPONSE_FAILURE } from "@src/constants/constants";
import type { SerializedBcs } from "@mysten/bcs";
import { ITransaction } from "@src/db/schema/transaction";
import axios from "axios";

export function convertB64ToPublicKey(
    publicKeyB64: string,
    flag: number
): PublicKey {
    // for flag schemes see https://docs.sui.io/concepts/cryptography/transaction-auth/signatures
    const pKeyUint = fromB64(publicKeyB64!);
    if (flag === 0) {
        return new Ed25519PublicKey(pKeyUint);
    }
    if (flag === 1) {
        return new Secp256k1PublicKey(pKeyUint);
    }
    if (flag === 2) {
        return new Secp256r1PublicKey(pKeyUint);
    }
    if (flag === 3) {
        return new MultiSigPublicKey(pKeyUint);
    }
    if (flag == 5) {
        return new ZkLoginPublicIdentifier(pKeyUint);
    }
    throw new Error("Invalid flag");
}

/**
 * Get url string to view txn on sui scan
 * @param network - network to get txn for
 * @param txn - txn hash/digest
 * @returns string
 */
export const getSuiVsionTxnUrl = (network: SuiNetworks, digest: string) => {
    return `https://${network}.suivision.xyz/txblock/${digest}`;
};

/**
 * Simulate write transaction
 * @param txn - transaction object
 * @param address - address of sender
 * @param suiClient - sui client
 * @param setSnackBarState - set snackbar state
 * @returns boolean
 */
export async function simulateWriteTxn(
    txn: Transaction,
    address: string,
    suiClient: SuiClient,
    setSnackBarState: Dispatch<SetStateAction<SnackbarState>>
): Promise<boolean> {
    const dryRun = await suiClient.devInspectTransactionBlock({
        sender: address,
        transactionBlock: txn,
    });
    console.log("dryRun =", dryRun);
    if (dryRun.effects.status.status === TXN_BLOCK_RESPONSE_FAILURE) {
        setSnackBarState({
            msg: dryRun.effects.status.error || "Transaction failed dryrun",
            status: "error",
        });
        return false;
    }
    return true;
}

/**
 * Get sui balance and format from bigInt
 * @param suiClient - sui client
 * @param address - address to get balance for
 * @returns number
 */
export const getSuiBalance = async (
    suiClient: SuiClient,
    address: string
): Promise<number> => {
    const balance = await suiClient.getBalance({
        owner: address,
    });
    return Number(balance.totalBalance) / Number(MIST_PER_SUI);
};

/**
 *  Build a transaction object
 * @param txn -transaction object
 * @param funcName - function name in module
 * @param moduleName - module name in package
 * @param packageId - id of package
 * @param args - function arguments
 * @param typeArgs - type arguments for function
 */
export async function buildSuiTxn(
    txn: Transaction,
    funcName: string,
    moduleName: string,
    packageId: string,
    args?: (TransactionArgument | SerializedBcs<any>)[],
    typeArgs?: string[]
): Promise<TransactionResult> {
    const result = txn.moveCall({
        target: `${packageId}::${moduleName}::${funcName}`,
        typeArguments: typeArgs,
        arguments: args,
    });

    return result;
}

/**
 * Get argument for trransaction based on transaction, type and value
 * @param txn - txn object
 * @param type - argument type (i.e. U8, U16, U32, U64, U128, U256, Address, Signer, object)
 * @param value - argument value
 * @returns transaction argument
 */
export function getArg(
    txn: Transaction,
    type: string,
    value: any
): TransactionArgument | SerializedBcs<any> {
    switch (type) {
        case "Bool":
            return txn.pure.bool(Boolean(value));
        case "U8":
            return txn.pure.u8(Number(value));
        case "U16":
            return txn.pure.u16(Number(value));
        case "U32":
            return txn.pure.u32(Number(value));
        case "U64":
            return txn.pure.u64(Number(value));
        case "U128":
            return txn.pure.u128(Number(value));
        case "U256":
            return txn.pure.u256(Number(value));
        case "Address":
            return txn.pure.address(value);
        case "Signer":
            return txn.object(value);
        case "object":
            return txn.object(value);
        case "chainedOutput":
            return txn.object(value);
        default:
            return txn.object(value);
    }
}

/**
 * Returns the type of the given SuiMoveNormalizedType.
 * @param {SuiMoveNormalizedType} type - the type to determine
 * @return {string} the type as a string, either "object" or the type if it's a string
 */
export const getArgType = (type: SuiMoveNormalizedType) => {
    if (typeof type === "object") {
        return "object";
    }
    if (typeof type === "string") {
        return type;
    }
    return "object";
};

/**
 * Returns the initial value for an argument based on its type.
 * @param {string} type - the type of the argument
 * @return the initial value for the argument
 */
export const getArgInitialValue = (type: string): false | "" => {
    if (type === "Bool") {
        return false;
    }
    return "";
};

/**
 * Returns an array of argument objects, each containing the type and initial value for a given parameter.
 * @param {SuiMoveNormalizedType[]} params - the parameters to generate arguments for
 * @return {{ type: string, value: any }[]} an array of argument objects
 */
export const getArgsFromParams = (params: SuiMoveNormalizedType[]) => {
    const args = params.map((param) => {
        const type = getArgType(param);
        const value = getArgInitialValue(type);
        return { type, value };
    });
    return args;
};

export const formatSuiType = (type: string) => {
    const split = type.split("::");
    split[0] = formatAddress(split[0]);

    return split.join("::");
};

export const createTxnInDB = async (
    newTxn: ITransaction,
    setSnackBarState: Dispatch<SetStateAction<SnackbarState>>
) => {
    const response = await axios.post("/api/createTransaction/", {
        txn: newTxn,
    });
    const responseData: HelixSafeApiResponse = response.data;
    if (!responseData.success || !responseData.data) {
        setSnackBarState({
            status: "error",
            msg: responseData.err || "Error proposing txn",
        });
        return;
    }
    return responseData.data as ITransaction;
};
