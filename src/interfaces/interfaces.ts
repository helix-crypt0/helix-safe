import { AlertColor } from "@mui/material";
import { Transaction } from "@mysten/sui/transactions";

export interface SnackbarState {
    msg: string;
    status: AlertColor;
    autohideDuration?: number; //ms
}

export interface HelixSafeApiResponse {
    success: boolean;
    data?: any;
    err?: string;
}

export type SuiNetworks = "testnet" | "mainnet" | "devnet";

export interface ChainedOutput {
    functionName: string;
    packageId: string;
    value: any;
    txn: Transaction;
}
