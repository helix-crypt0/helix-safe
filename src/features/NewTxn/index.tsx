import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import TxnBuilder from "../TxnBuilder";
import ProposeTxn from "../ProposeTxn";

const NewTxn: React.FC = () => {
    const [tab, setTab] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };
    const renderTabContent = () => {
        if (tab == 0) {
            return <TxnBuilder />;
        }
        if (tab == 1) {
            return <ProposeTxn />;
        }
    };
    return (
        <Stack>
            <Typography variant="h5">New Transaction</Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2, mt: 2 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    aria-label="transactions tabs"
                >
                    <Tab label={`Transaction Builder`} />
                    <Tab label="Raw Bytes" />
                </Tabs>
            </Box>
            {renderTabContent()}
        </Stack>
    );
};
export default NewTxn;
