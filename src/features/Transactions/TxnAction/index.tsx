import { Button, Stack, Typography } from "@mui/material";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { MultiSigMember } from "@src/db/schema/multisig";
import { ITransaction } from "@src/db/schema/transaction";
import { SuiNetworks } from "@src/interfaces/interfaces";
import { formatTimestamp } from "@src/util/datetimeUtil";
import { getSuiVsionTxnUrl } from "@src/util/suiUtil";
import {
    getTotalSignatureWeight,
    hasMemberSignedTxn,
    willMemberSignatureExceedThreshold,
} from "@src/util/txnUtil";
import { navigateToSite } from "@src/util/util";

interface Props {
    txn: ITransaction;
    member: MultiSigMember | undefined;
    handleExecute: (transaction: ITransaction) => Promise<void>;
    handleSign: (
        transaction: ITransaction,
    ) => Promise<ITransaction | undefined>;
}

const TxnAction: React.FC<Props> = ({
    txn,
    member,
    handleExecute,
    handleSign,
}) => {
    const { selectedMSig } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const readyForExecution =
        getTotalSignatureWeight(txn) >= selectedMSig.threshold;
    const alreadyExecuted = !!txn.executedTimestamp || !!txn.digest;
    const canExecuteAfterSigning = member
        ? willMemberSignatureExceedThreshold(txn, member, selectedMSig)
        : false;
    const hasSigned = member ? hasMemberSignedTxn(txn, member) : false;

    /**
     * Sign and execute transaction
     * @param transaction - transaction to sign and execute
     */
    const handleSignAndExecute = async (transaction: ITransaction) => {
        const newTxn = await handleSign(transaction);
        if (!newTxn) return;
        await handleExecute(newTxn);
    };

    /**
     * Navigate to suivision to view successful txn
     */
    const navigateToSuiTxn = (digest: string) => {
        const rawNetwork = currentAccount?.chains[0];
        const network = rawNetwork?.split(":")[1] || "mainnet";
        const url = getSuiVsionTxnUrl(network as SuiNetworks, digest);
        navigateToSite(url);
    };

    /**
     * Txn that is already executed
     * @returns JSX
     */
    const renderCompleted = () => {
        return (
            <Stack>
                <Button
                    variant="contained"
                    onClick={() => navigateToSuiTxn(txn.digest || "")}
                >
                    View Txn
                </Button>
                {txn.executedTimestamp && (
                    <Typography
                        variant="subtitle2"
                        fontSize={"small"}
                        sx={{ fontStyle: "italic" }}
                    >
                        Completed: {formatTimestamp(txn.executedTimestamp)}
                    </Typography>
                )}
            </Stack>
        );
    };

    /**
     * Render ready for execution button
     * @returns JSX
     */
    const renderReadyForExecution = () => {
        return (
            <Button
                variant="contained"
                color="success"
                onClick={() => handleExecute(txn)}
            >
                Execute
            </Button>
        );
    };

    /**
     *  Render ready for signing buttons
     * @returns JSX
     */
    const renderReadyForSigning = () => {
        return (
            <Stack direction={"row"}>
                <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{ ml: 1 }}
                    onClick={() => handleSign(txn)}
                >
                    Sign
                </Button>
                {canExecuteAfterSigning && (
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ ml: 1 }}
                        onClick={() => handleSignAndExecute(txn)}
                    >
                        Sign And Execute
                    </Button>
                )}
            </Stack>
        );
    };

    /**
     * Render txn actions
     * @returns JSX
     */
    const renderActions = () => {
        if (alreadyExecuted) {
            return renderCompleted();
        }
        if (readyForExecution) {
            return renderReadyForExecution();
        }
        if (hasSigned) {
            return null;
        }
        return renderReadyForSigning();
    };

    return renderActions();
};
export default TxnAction;
