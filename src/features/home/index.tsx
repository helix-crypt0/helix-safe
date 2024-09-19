import { Button, Stack, Typography } from "@mui/material";
import { useCurrentAccount } from "@mysten/dapp-kit";
import CreateNewMultiSigDialog from "@src/components/CreateNewMultiSigDialog";
import MultiSigTable from "@src/components/MultiSigTable";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { useState } from "react";
import ProposeTxn from "../ProposeTxn";
import Transactions from "../Transactions";

const Home: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const { multisigsAccounts } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const connected = !!currentAccount;
    return (
        <Stack className="centered" gap={4} width={"100%"}>
            <MultiSigTable multisigs={multisigsAccounts} />
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
                Create New MultiSig Account
            </Button>
            {connected && (
                <CreateNewMultiSigDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                />
            )}
            <Typography variant="h5">Transactions</Typography>
            <ProposeTxn />
            <Transactions />
        </Stack>
    );
};

export default Home;
