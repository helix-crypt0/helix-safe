import { Stack, Typography } from "@mui/material";
import SuiAddress from "@src/components/SuiAddress";
import { ITransaction } from "@src/db/schema/transaction";
import { formatTimestamp } from "@src/util/datetimeUtil";
import {
    getOrderedSignatures,
    getSignatureTime,
    getTotalSignatureWeight,
    hasMemberSignedTxn,
} from "@src/util/txnUtil";
import TxnAction from "../TxnAction";
import { fromB64 } from "@mysten/sui/utils";
import axios from "axios";
import { Transaction } from "@mysten/sui/transactions";
import { Check, HourglassBottom } from "@mui/icons-material";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { MultiSigMember } from "@src/db/schema/multisig";
import {
    useCurrentAccount,
    useSignTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import {
    convertB64ToPublicKey,
    getSuiBalance,
    simulateWriteTxn,
} from "@src/util/suiUtil";
import { MIN_SUI_BALANCE } from "@src/constants/constants";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { getMongoStringId } from "@src/util/util";
import { HelixSafeApiResponse } from "@src/interfaces/interfaces";

interface Props {
    txn: ITransaction;
    onClick?: () => void;
}
const TransactionItem: React.FC<Props> = ({ txn, onClick }) => {
    const {
        transactions,
        selectedMSig,
        setIsLoadingGlobal,
        setSnackBarState,
        txnMap,
        setTxnMap,
    } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signTransaction } = useSignTransaction();

    const suiClient = useSuiClient();
    const address = currentAccount?.address;
    const isConnected = !!address;
    const member: MultiSigMember | undefined = selectedMSig?.members?.find(
        (m) => m.address === address
    );

    /**
     * Handle signing transaction
     * @param transaction - transaction to sign
     */
    const handleExecute = async (transaction: ITransaction) => {
        if (!isConnected) {
            const errMsg = "Wallet not connected";
            console.error(errMsg);
            setSnackBarState({ msg: errMsg, status: "error" });
            return;
        }
        try {
            setIsLoadingGlobal(true);

            // run dry run first to make sure txn won't fail
            const dryRunSuccess = await simulateWriteTxn(
                Transaction.from(fromB64(transaction.bytesB64)),
                address,
                suiClient,
                setSnackBarState
            );
            if (!dryRunSuccess) {
                setIsLoadingGlobal(false);
                return;
            }

            // check balance
            const balance = await getSuiBalance(
                suiClient,
                selectedMSig.address
            );
            if (balance < MIN_SUI_BALANCE) {
                setSnackBarState({
                    status: "error",
                    msg: `Unable to execute transaction. MultiSig Address ${selectedMSig.address} must have at least ${MIN_SUI_BALANCE} but only has ${balance}. Send SUI coins to that address and try again.`,
                });
                return;
            }

            // get public keys to create the multiSigPublicKey
            const multiSigMembers = selectedMSig.members;
            const pubKeys = multiSigMembers.map((m) => {
                return {
                    weight: m.weight,
                    publicKey: convertB64ToPublicKey(m.publicKeyB64!, m.flag!),
                };
            });

            const multiSigPublicKey: MultiSigPublicKey =
                MultiSigPublicKey.fromPublicKeys({
                    threshold: selectedMSig.threshold,
                    publicKeys: pubKeys,
                });

            // get combined signature
            // first have to order sig`s based on the order of the multisig members
            const orderedSignatures = getOrderedSignatures(
                selectedMSig,
                transaction
            );
            const signatures = orderedSignatures.map((sig) => sig.signature);

            const combinedSignature =
                multiSigPublicKey.combinePartialSignatures(signatures);

            // execute txn
            const result = await suiClient.executeTransactionBlock({
                transactionBlock: fromB64(transaction.bytesB64),
                signature: combinedSignature,
            });

            // save digest to db
            const response = await axios.post("/api/executeTransaction/", {
                txnId: getMongoStringId(transaction),
                digest: result.digest,
            });

            const responseData: HelixSafeApiResponse = response.data;
            if (!responseData.success || !responseData.data) {
                setSnackBarState({
                    status: "warning",
                    msg: `The transaction was executed successfully but there was an error updating the transaction in the database. Please check the transaction on suivision to confirm the execution.\n Txn Digest: ${result.digest}. \mError:${responseData.err}`,
                });
                return;
            }
            const txnResponse: ITransaction = responseData.data;
            const newTxns: ITransaction[] = transactions.map((t) =>
                t._id === txnResponse._id ? txnResponse : t
            );
            setTxnMap({
                ...txnMap,
                [selectedMSig.address]: newTxns,
            });
            setSnackBarState({
                status: "success",
                msg: `The transaction was executed successfully. Txn Digest: ${result.digest}`,
            });
        } catch (e) {
            console.error(`Unable to execute transaction: ${e}`);
            setSnackBarState({
                status: "error",
                msg: `Unable to execute transaction: ${e}`,
            });
        } finally {
            setIsLoadingGlobal(false);
        }
    };

    /**
     * Handle signing transaction
     * @param transaction - transaction to sign
     */
    const handleSign = async (transaction: ITransaction) => {
        if (!isConnected) {
            const errMsg = "Wallet not connected";
            console.error(errMsg);
            setSnackBarState({ msg: errMsg, status: "error" });
            return;
        }
        setIsLoadingGlobal(true);
        try {
            const txn = Transaction.from(fromB64(transaction.bytesB64));

            // run dry run first to make sure txn won't fail
            const dryRunSuccess = await simulateWriteTxn(
                Transaction.from(fromB64(transaction.bytesB64)),
                address,
                suiClient,
                setSnackBarState
            );
            if (!dryRunSuccess) {
                setIsLoadingGlobal(false);
                return;
            }

            const { signature } = await signTransaction({
                transaction: txn,
            });

            const response = await axios.post("/api/approveTransaction/", {
                txnId: getMongoStringId(transaction),
                signature,
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
            const newTxns: ITransaction[] = transactions.map((t) =>
                t._id === txnResponse._id ? txnResponse : t
            );
            setTxnMap({
                ...txnMap,
                [selectedMSig.address]: newTxns,
            });
            setSnackBarState({
                status: "success",
                msg: "Transaction signed successfully",
            });
            return txnResponse;
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

    /**
     * Renders a checkmark if the member is verified or an hourglass if not
     * @param member - member object
     * @returns JSX
     */
    const renderIcon = (hasSigned: boolean) => {
        if (hasSigned) {
            return (
                <Check
                    fontSize="small"
                    color="success"
                    sx={{ width: "18px" }}
                />
            );
        }
        return (
            <HourglassBottom
                fontSize="small"
                color="warning"
                sx={{ width: "18px" }}
            />
        );
    };

    /**
     * Renders members for a given txn
     * @param txn - txn to render members for
     * @returns JSX
     */
    const renderMembers = (txn: ITransaction) => {
        return selectedMSig.members.map((member) => {
            const hasSigned = hasMemberSignedTxn(txn, member);
            const signatureTime = getSignatureTime(txn, member);
            return (
                <Stack key={member.address} mt={1}>
                    <Stack alignItems={"center"} direction={"row"} gap={0.5}>
                        {renderIcon(hasSigned)}
                        <SuiAddress address={member.address} variant="body1" />
                        <Typography variant="subtitle2">
                            ({member.weight})
                        </Typography>
                    </Stack>
                    {signatureTime > 0 && (
                        <Typography variant="caption" ml={3}>
                            Signed: {formatTimestamp(signatureTime)}
                        </Typography>
                    )}
                </Stack>
            );
        });
    };

    return (
        <Stack
            direction="row"
            spacing={3}
            mt={1}
            className="txnStack"
            role="button"
            onClick={onClick}
        >
            <Stack>
                {txn.name && (
                    <Typography>
                        Name:{" "}
                        <span style={{ fontWeight: "bold" }}>{txn.name}</span>
                    </Typography>
                )}
                <Typography
                    variant="subtitle2"
                    fontSize={"small"}
                    sx={{ fontStyle: "italic" }}
                >
                    Proposed: {formatTimestamp(txn.signatures[0].timestamp)} by{" "}
                    {<SuiAddress address={txn.signatures[0].address} />}
                </Typography>
            </Stack>
            <Stack>
                <Typography fontWeight={"bold"}>
                    Signatures (
                    {`${getTotalSignatureWeight(txn)}/${
                        selectedMSig.threshold
                    }`}
                    )
                </Typography>
                {renderMembers(txn)}
            </Stack>
            <TxnAction
                txn={txn}
                member={member}
                handleExecute={handleExecute}
                handleSign={handleSign}
            />
        </Stack>
    );
};

export default TransactionItem;
