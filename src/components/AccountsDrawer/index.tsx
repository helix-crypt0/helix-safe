import {
    Badge,
    Button,
    Chip,
    Divider,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { IMultisig } from "@src/db/schema/multisig";
import PixelAvatar from "../PixelAvatar";
import {
    getThresholdAndWeight,
    handleMSigChange,
} from "@src/util/multisigUtil";
import StyledDrawer from "./styled";
import { useRouter } from "next/router";
import SuiAddress from "../SuiAddress";
import CreateNewMultiSigDialog from "../CreateNewMultiSigDialog";
import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface AccountsDrawerProps {
    open: boolean;
    onClose: () => void;
}
const drawerWidth = 400;

const AccountsDrawer: React.FC<AccountsDrawerProps> = ({ open, onClose }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const { multisigsAccounts, selectedMSig } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const connected = !!currentAccount;
    const router = useRouter();

    /**
     * Renders a multisig account component with a badge, avatar, and copyable address.
     *
     * @param {IMultisig} multisig - the multisig account object to render
     * @param {number} index - the index of the multisig account in the list
     * @return {JSX.Element} the rendered multisig account component
     */
    const renderMsig = (multisig: IMultisig, index: number) => {
        return (
            <Stack
                key={index}
                className="msigStack"
                onClick={() => handleMSigChange(multisig, router)}
            >
                <Badge
                    badgeContent={getThresholdAndWeight(multisig)}
                    color="primary"
                    overlap="circular"
                >
                    <PixelAvatar address={multisig.address} />
                </Badge>
                <Stack ml={2} mr={1}>
                    <SuiAddress address={multisig.address} />
                    {multisig.name && (
                        <Typography variant="subtitle2">
                            {multisig.name}
                        </Typography>
                    )}
                </Stack>
                {multisig.address === selectedMSig.address && (
                    <Chip label="selected" color="primary" size="small" />
                )}
            </Stack>
        );
    };

    return (
        <StyledDrawer
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                },
            }}
        >
            <Toolbar />
            <Stack sx={{}} spacing={2} padding={2}>
                <Typography variant="h6">
                    Multisig Accounts ({multisigsAccounts.length})
                    <IconButton
                        size="small"
                        onClick={onClose}
                        sx={{ float: "right" }}
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenDialog(true)}
                >
                    Create New MultiSig
                </Button>
                <Divider />
                <Stack spacing={2}>
                    {multisigsAccounts.map((multisig, index) =>
                        renderMsig(multisig, index),
                    )}
                </Stack>
            </Stack>
            {connected && (
                <CreateNewMultiSigDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                />
            )}
        </StyledDrawer>
    );
};
export default AccountsDrawer;
