import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    OutlinedInput,
    Stack,
    Typography,
} from "@mui/material";
import { BLANK_MULTISIG, CONFIRM_MSG } from "@src/constants/constants";
import { IMultisig, MultiSigMember } from "@src/db/schema/multisig";
import { useState } from "react";
import MultiSigMemberTable from "./MultiSigMemberTable";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { toB64 } from "@mysten/sui/utils";
import StyledCreateMSigDialog from "./styled";
import NumberInput from "../NumberInput";
import { getTotalWeight } from "@src/util/multisigUtil";
import axios from "axios";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { HelixSafeApiResponse } from "@src/interfaces/interfaces";

interface Props {
    open: boolean;
    onClose: () => void;
}

const CreateNewMultiSigDialog: React.FC<Props> = ({ open, onClose }) => {
    const { setIsLoadingGlobal, setMultisigsAccounts, setSnackBarState } =
        useGlobalContext();
    const currentAccount = useCurrentAccount();
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    const pkey: string = currentAccount?.publicKey
        ? toB64(currentAccount.publicKey)
        : "";
    const initialMember: MultiSigMember = {
        address: currentAccount?.address || "",
        publicKeyB64: pkey,
        weight: 1,
    };
    const [newMSig, setNewMSig] = useState<IMultisig>({
        ...BLANK_MULTISIG,
        members: [initialMember],
    });

    /**
     * Handle updating the newMSig object when input fields change
     * @param e - event object
     */
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewMSig((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handle creating a new multisig account
     */
    const handleCreate = () => {
        setIsLoadingGlobal(true);
        // first have the user sign a message
        signPersonalMessage(
            {
                message: new TextEncoder().encode(CONFIRM_MSG),
            },
            {
                onSuccess: async (result) => {
                    console.log("result ->", result);
                    const response = await axios.post("/api/createMultiSig/", {
                        msig: newMSig,
                        signature: result.signature,
                        bytes: result.bytes,
                    });
                    console.log("response = ", response);
                    const responseData: HelixSafeApiResponse = response.data;
                    if (!responseData.success || !responseData.data) {
                        setSnackBarState({
                            status: "error",
                            msg: responseData.err || "Error creating multisig",
                        });
                        setIsLoadingGlobal(false);
                        return;
                    }
                    const newMSigResponse: IMultisig = responseData.data;
                    setMultisigsAccounts((prev) => [...prev, newMSigResponse]);
                    onClose();
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

    return (
        <StyledCreateMSigDialog
            open={open}
            onClose={onClose}
            id="dialogContainer"
            fullWidth
            maxWidth={"md"}
        >
            <DialogTitle>Create New MultiSig Account</DialogTitle>
            <DialogContent className="content">
                <Stack spacing={2}>
                    <Typography variant="h6">Details</Typography>
                    <Stack>
                        <Typography>Name:</Typography>
                        <OutlinedInput
                            size="small"
                            placeholder="My MultSig"
                            name="name"
                            value={newMSig.name || ""}
                            onChange={handleInputChange}
                        />
                    </Stack>
                    <Stack>
                        <Typography>Description:</Typography>
                        <OutlinedInput
                            size="small"
                            placeholder="My new multisig account"
                            name="description"
                            value={newMSig.description || ""}
                            onChange={handleInputChange}
                        />
                    </Stack>
                    <MultiSigMemberTable
                        newMSig={newMSig}
                        setNewMSig={setNewMSig}
                    />
                    <Stack>
                        <Typography variant="h6">Threshold</Typography>
                        <Stack direction="row" alignItems="center">
                            <NumberInput
                                value={newMSig.threshold}
                                min={1}
                                max={getTotalWeight(newMSig)}
                                onChange={(value) =>
                                    setNewMSig((prev) => ({
                                        ...prev,
                                        threshold: value,
                                    }))
                                }
                            />
                            <Typography ml={1}>
                                out of {getTotalWeight(newMSig)} total weight
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleCreate}>
                    Create
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </StyledCreateMSigDialog>
    );
};
export default CreateNewMultiSigDialog;
