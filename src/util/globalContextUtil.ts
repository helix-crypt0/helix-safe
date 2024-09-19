import { IMultisig } from "@src/db/schema/multisig";
import { ITransaction } from "@src/db/schema/transaction";
import { HelixSafeApiResponse } from "@src/interfaces/interfaces";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";

/**
 * Fetch and set transactions for all multisig accounts
 * @param mSigs - multisig accounts
 * @param setTxnMap - set map of transactions for all multisig accounts
 */
export const fetchAndSetTransactions = async (
    mSigs: IMultisig[],
    setTxnMap: Dispatch<
        SetStateAction<{
            [address: string]: ITransaction[];
        }>
    >
) => {
    // call backend to fetch txns for all addresses
    const txnResponse = await axios.post("/api/fetchTransactions/", {
        multisigAddresses: mSigs.map((m) => m.address),
    });
    const txnApiResponse: HelixSafeApiResponse = txnResponse.data;
    if (txnApiResponse.success && txnApiResponse.data) {
        setTxnMap(txnApiResponse.data);
    }
};
