import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Box,
    Typography,
    Button,
    Stack,
} from "@mui/material";
import { Check, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { IMultisig, MultiSigMember } from "@src/db/schema/multisig";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { checkIsMultisigPendingUser } from "@src/util/multisigUtil";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import axios from "axios";
import { CONFIRM_MSG } from "@src/constants/constants";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { HelixSafeApiResponse } from "@src/interfaces/interfaces";
import { getMongoStringId } from "@src/util/util";
import SuiAddress from "@src/components/SuiAddress";

const IndividualMemberRow: React.FC<{ member: MultiSigMember }> = ({
    member,
}) => {
    /**
     * Renders a checkmark if the member is verified or an hourglass if not
     * @param member - member object
     * @returns JSX
     */
    const renderVerified = (member: MultiSigMember) => {
        if (member.publicKeyB64) {
            return (
                <Check
                    fontSize="small"
                    color="success"
                    sx={{ width: "18px" }}
                />
            );
        }
        return (
            <HourglassBottomIcon
                fontSize="small"
                color="warning"
                sx={{ width: "18px" }}
            />
        );
    };

    return (
        <TableRow>
            <TableCell sx={{ display: "flex" }}>
                {renderVerified(member)}
                <SuiAddress address={member.address} />
            </TableCell>
            <TableCell>{member.weight}</TableCell>
        </TableRow>
    );
};

interface MultiSigRowProps {
    multisig: IMultisig;
}

const MultiSigMembersRow: React.FC<MultiSigRowProps> = ({ multisig }) => {
    const [open, setOpen] = useState(false);
    const {
        setSnackBarState,
        setIsLoadingGlobal,
        setMultisigsAccounts,
        multisigsAccounts,
    } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    const handleAccept = () => {
        setIsLoadingGlobal(true);
        signPersonalMessage(
            {
                message: new TextEncoder().encode(CONFIRM_MSG),
            },
            {
                onSuccess: async (result) => {
                    console.log("result ->", result);
                    const response = await axios.post("/api/approveMultiSig/", {
                        msigId: getMongoStringId(multisig),
                        signature: result.signature,
                        bytes: result.bytes,
                    });
                    console.log("response = ", response);
                    const responseData: HelixSafeApiResponse = response.data;
                    if (!responseData.success || !responseData.data) {
                        setSnackBarState({
                            status: "error",
                            msg:
                                responseData.err || "Error confirming multisig",
                        });
                        return;
                    }
                    const newMSigResponse: IMultisig = responseData.data;
                    const newAccounts: IMultisig[] = multisigsAccounts.map(
                        (msig) => {
                            if (msig._id === newMSigResponse._id) {
                                return newMSigResponse;
                            }
                            return msig;
                        }
                    );
                    setMultisigsAccounts(newAccounts);
                },
                onError: (error) => {
                    console.error("error ->", error);
                },
                onSettled: () => {
                    console.log("settled");
                    setIsLoadingGlobal(false);
                },
            }
        );
    };

    /**
     * renders accept and reject buttons for pending users
     * @returns JSX
     */
    const renderAcceptReject = () => {
        const isPendingUser = checkIsMultisigPendingUser(multisig, address);
        if (!isPendingUser) return null;
        return (
            <Stack flexDirection={"row"}>
                <Button onClick={handleAccept}>Accept</Button>
                <Button color="warning">Reject</Button>
            </Stack>
        );
    };

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {multisig.members.length}
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                            >
                                Members
                            </Typography>
                            <Table size="small" aria-label="members">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Member Address</TableCell>
                                        <TableCell>Weight</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {multisig.members.map(
                                        (member, memberIndex) => (
                                            <IndividualMemberRow
                                                key={memberIndex}
                                                member={member}
                                            />
                                        )
                                    )}
                                </TableBody>
                            </Table>
                            {renderAcceptReject()}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default MultiSigMembersRow;
