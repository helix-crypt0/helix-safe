import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SuiAddress from "@src/components/SuiAddress";
import { useState } from "react";

function TransferDialog({
    objId,
    onClose,
    onSend,
}: {
    objId: string;
    onClose: () => void;
    onSend: (address: string, objId: string) => void;
}) {
    const [address, setAddress] = useState("");
    return (
        <Dialog open={!!objId} onClose={onClose} fullWidth>
            <DialogContent>
                <Stack direction="row" gap={1}>
                    <Typography variant="h6"> Send </Typography>{" "}
                    <SuiAddress address={objId} variant="h6" />
                </Stack>
                <DialogContentText>
                    Enter the address of the recipient
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Address"
                    type="text"
                    fullWidth
                    onChange={(e) => setAddress(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => onSend(address, objId)}
                    variant="contained"
                >
                    Propose Send
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TransferDialog;
