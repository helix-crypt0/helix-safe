import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { useSuiClient } from "@mysten/dapp-kit";
import {
    DryRunTransactionBlockResponse,
    MoveCallSuiTransaction,
} from "@mysten/sui/client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SuiAddress from "@src/components/SuiAddress";
import { ITransaction } from "@src/db/schema/transaction";
import { formatTimestamp } from "@src/util/datetimeUtil";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import TransactionItem from "../TransactionItem";

interface Props {
    txn: ITransaction;
}
const TransactionDetails: React.FC<Props> = ({ txn }) => {
    const suiClient = useSuiClient();
    const { selectedMSig } = useGlobalContext();
    const router = useRouter();
    const [details, setDetails] = useState<DryRunTransactionBlockResponse>();

    useEffect(() => {
        const getDetails = async () => {
            // TODO: for completed txns, uses uiClient.getTransactionBlock
            const dryRun = await suiClient.dryRunTransactionBlock({
                transactionBlock: txn.bytesB64,
            });
            setDetails(dryRun);
        };
        getDetails();
    }, [txn.bytesB64]);

    const goBack = () => {
        const getTxnInfo = async (txn: ITransaction) => {
            router.replace(
                {
                    pathname: router.pathname,
                    query: { msig: selectedMSig.address },
                },
                undefined,
                { shallow: true }
            );
        };
    };

    const renderStat = (title: string, value: string, keyValue?: string) => {
        return (
            <Grid
                container
                direction={"row"}
                gap={0.5}
                key={keyValue || title + value}
            >
                <Grid item xs={5} md={3} lg={2.5}>
                    <Typography variant="subtitle2" className="slightText">
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography>{value}</Typography>
                </Grid>
            </Grid>
        );
    };

    if (!details) return <CircularProgress />;

    const renderInputs = () => {
        const inputTransaction = details.input.transaction;
        if (inputTransaction.kind === "ProgrammableTransaction") {
            return inputTransaction.inputs.map((input, idx) => (
                <Accordion key={"input" + idx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Input {idx}
                    </AccordionSummary>
                    <AccordionDetails>
                        {Object.entries(input).map(([key, value]) =>
                            renderStat(
                                key,
                                `${value}`,
                                `index${idx}_ ${key}_ ${value}`
                            )
                        )}
                    </AccordionDetails>
                </Accordion>
            ));
        }
    };

    const renderMoveCall = () => {
        const inputTransaction = details.input.transaction;
        if (inputTransaction.kind === "ProgrammableTransaction") {
            const transactions = inputTransaction.transactions;
            return transactions.map((txn: any, idx) => {
                if (txn.MoveCall) {
                    const moveCall: MoveCallSuiTransaction = txn.MoveCall;
                    return (
                        <Stack key={"txn" + idx} mt={1}>
                            {idx > 0 && (
                                <Divider style={{ marginBottom: 10 }} />
                            )}
                            {renderStat("function", moveCall.function)}
                            {renderStat("module", moveCall.module)}
                            {renderStat("package", moveCall.package)}
                            {moveCall.type_arguments?.map((type, idx) =>
                                renderStat("type", type)
                            )}
                        </Stack>
                    );
                }
            });
        }
    };

    return (
        <Stack gap={3} mt={3} id="txnDetailsStack">
            <Stack>
                <Typography fontWeight={"bold"} fontSize={"large"}>
                    Overview
                </Typography>
                <TransactionItem txn={txn} />
            </Stack>
            <Stack id="txnDetails">
                <Typography fontWeight={"bold"} fontSize={"large"}>
                    Transaction Commands
                </Typography>
                {renderMoveCall()}
            </Stack>
            <Stack id="inputs">
                <Typography fontWeight={"bold"} fontSize={"large"}>
                    Inputs
                </Typography>
                {renderInputs()}
            </Stack>
            {details.effects.dependencies && (
                <Stack id="dependencies">
                    <Typography fontWeight={"bold"} fontSize={"large"}>
                        Dependencies
                    </Typography>
                    {details.effects.dependencies.map((dep, idx) => (
                        <Typography key={"dependency" + idx} color={"primary"}>
                            <SuiAddress address={dep} showFull />
                        </Typography>
                    ))}
                </Stack>
            )}
            <Stack id="gasDetails">
                <Typography fontWeight={"bold"} fontSize={"large"}>
                    Gas Used
                </Typography>
                {renderStat(
                    "Computation Cost",
                    details.effects.gasUsed.computationCost
                )}
                {renderStat(
                    "Nonrefundable Storage Fee",
                    details.effects.gasUsed.nonRefundableStorageFee
                )}
                {renderStat(
                    "Storage Cost",
                    details.effects.gasUsed.storageCost
                )}
                {renderStat(
                    "Storage Rebate",
                    details.effects.gasUsed.storageRebate
                )}
            </Stack>
        </Stack>
    );
};
export default TransactionDetails;
