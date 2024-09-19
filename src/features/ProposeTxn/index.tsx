import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import {
    useCurrentAccount,
    useSignTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { ITransaction } from "@src/db/schema/transaction";
import { fromB64 } from "@mysten/sui/utils";
import { getWeightForAddressFromMSig } from "@src/util/multisigUtil";
import axios from "axios";
import { HelixSafeApiResponse } from "@src/interfaces/interfaces";
import { simulateWriteTxn } from "@src/util/suiUtil";

const ProposeTxn: React.FC = () => {
    const {
        setIsLoadingGlobal,
        setSnackBarState,
        selectedMSig,
        setTxnMap,
        txnMap,
        transactions,
    } = useGlobalContext();
    const [txnBytesBase64, setTxnBytesBase64] = useState<string>("");
    const [txnName, setTxnName] = useState<string>("");
    const { mutateAsync: signTransaction } = useSignTransaction();
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;
    const suiClient = useSuiClient();

    /**
     * Get signature from multisig signer
     */
    const signAndCreateTxn = async () => {
        if (!address) return;
        console.log("selected msig address ", selectedMSig.address);
        setIsLoadingGlobal(true);
        try {
            const txn = Transaction.from(fromB64(txnBytesBase64));

            //run dry run first to make sure txn won't fail
            const dryRunSuccess = await simulateWriteTxn(
                txn,
                address,
                suiClient,
                setSnackBarState
            );
            if (!dryRunSuccess) {
                setIsLoadingGlobal(false);
                return;
            }

            txn.setSender(selectedMSig.address); // multisig account
            const { signature } = await signTransaction({
                transaction: txn,
            });
            const newTxn: ITransaction = {
                multisigAddress: selectedMSig.address,
                bytesB64: txnBytesBase64,
                name: txnName,
                signatures: [
                    {
                        signature,
                        weight: getWeightForAddressFromMSig(
                            selectedMSig,
                            address
                        ),
                        address: address,
                        timestamp: Date.now(),
                    },
                ],
            };

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
            const txnResponse: ITransaction = responseData.data;
            setTxnMap({
                ...txnMap,
                [selectedMSig.address]: [...transactions, txnResponse],
            });
            setSnackBarState({
                status: "success",
                msg: "Transaction proposed successfully",
            });
            setTxnBytesBase64("");
            setTxnName("");
        } catch (e) {
            const errMsg = `Unable to propose txn: ${e}`;
            console.error(errMsg);
            setSnackBarState({
                status: "error",
                msg: errMsg,
            });
        } finally {
            setIsLoadingGlobal(false);
        }
    };

    return (
        <Stack style={{ width: "100%" }} gap={1}>
            <Typography variant="h6" gutterBottom>
                Propose Transaction
            </Typography>
            <Stack>
                <Typography>Txn Name</Typography>
                <TextField
                    value={txnName}
                    size="small"
                    onChange={(e) => setTxnName(e.target.value)}
                    sx={{ maxWidth: "400px" }}
                />
            </Stack>
            <Stack>
                <Typography>Txn Bytes Base64</Typography>
                <TextField
                    multiline
                    minRows={2}
                    fullWidth
                    value={txnBytesBase64}
                    onChange={(e) => setTxnBytesBase64(e.target.value)}
                />
            </Stack>
            <Button variant="contained" onClick={signAndCreateTxn}>
                Propose
            </Button>
        </Stack>
    );
};

export default ProposeTxn;
