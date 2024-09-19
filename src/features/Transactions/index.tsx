import {
    Box,
    Button,
    Divider,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { ITransaction } from "@src/db/schema/transaction";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getMongoStringId } from "@src/util/util";
import { useEffect, useState } from "react";
import StyledTransactions from "./styled";
import TransactionDetails from "./TransactionDetails";
import { useRouter } from "next/router";
import TransactionItem from "./TransactionItem";

const Transactions: React.FC = () => {
    const { transactions, selectedMSig } = useGlobalContext();
    const router = useRouter();
    const { txnId }: { txnId?: string } = router.query;
    const [tab, setTab] = useState(0);
    const [selectedTxn, setSelectedTxn] = useState<ITransaction | undefined>();

    const completedTxns = transactions.filter(
        (txn) => txn.executedTimestamp || txn.digest,
    );
    const pendingTxns = transactions.filter(
        (txn) => !txn.executedTimestamp && !txn.digest,
    );
    const txnsToShow = tab === 0 ? pendingTxns : completedTxns;

    useEffect(() => {
        if (txnId && transactions) {
            const txn = transactions.find((t) => getMongoStringId(t) === txnId);
            setSelectedTxn(txn);
        }
    }, [txnId, transactions]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    /**
     * Debug function to inspect a transaction block
     * @param txn - ITransaction object
     */
    const getTxnInfo = async (txn: ITransaction) => {
        router.replace(
            {
                pathname: router.pathname,
                query: { ...router.query, txnId: getMongoStringId(txn) },
            },
            undefined,
            { shallow: true },
        );
    };

    const goBackToTxns = () => {
        router.replace(
            {
                pathname: router.pathname,
                query: { msig: selectedMSig.address },
            },
            undefined,
            { shallow: true },
        );
    };

    if (selectedTxn) {
        return (
            <Stack>
                <Button onClick={goBackToTxns} startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Typography variant="h5" fontWeight={"bold"}>
                    Transaction Details
                </Typography>
                <TransactionDetails txn={selectedTxn} />
            </Stack>
        );
    }

    return (
        <StyledTransactions style={{ width: "100%" }}>
            <Typography variant="h5">Transactions</Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    aria-label="basic tabs example"
                >
                    <Tab label={`Queue (${pendingTxns.length})`} />
                    <Tab label="Completed" />
                </Tabs>
            </Box>
            {txnsToShow.map((txn, idx) => (
                <Stack key={idx} mt={2}>
                    {idx !== 0 && <Divider />}
                    <TransactionItem
                        onClick={() => getTxnInfo(txn)}
                        txn={txn}
                    />
                </Stack>
            ))}
        </StyledTransactions>
    );
};

export default Transactions;
