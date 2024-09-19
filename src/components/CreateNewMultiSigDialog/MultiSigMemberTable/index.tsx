import React, { Dispatch, SetStateAction, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    Chip,
    Typography,
} from "@mui/material";
import { Edit, Delete, Save, Add } from "@mui/icons-material";
import { IMultisig, MultiSigMember } from "@src/db/schema/multisig";
import { BLANK_MULTISIG_MEMBER } from "@src/constants/constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toB64 } from "@mysten/sui/utils";
import StyledTableContainer from "./styled";
import NumberInput from "@src/components/NumberInput";

interface Props {
    newMSig: IMultisig;
    setNewMSig: Dispatch<SetStateAction<IMultisig>>;
}
const MultiSigMemberTable: React.FC<Props> = ({ newMSig, setNewMSig }) => {
    const currentAccount = useCurrentAccount();
    const [newMember, setNewMember] = useState<MultiSigMember>(
        BLANK_MULTISIG_MEMBER,
    );
    const multiSigMembers: MultiSigMember[] = newMSig.members;

    const isMemberMe = (member: MultiSigMember) => {
        return member.address === currentAccount?.address;
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
    ) => {
        const { name, value } = e.target;
        const updatedMembers = [...multiSigMembers];
        updatedMembers[index] = { ...updatedMembers[index], [name]: value };
        setNewMSig((prev) => ({ ...prev, members: updatedMembers }));
    };

    const handleWeightUpdate = (value: number, index: number) => {
        const updatedMembers = [...multiSigMembers];
        updatedMembers[index] = {
            ...updatedMembers[index],
            weight: value,
        };
        setNewMSig((prev) => ({
            ...prev,
            members: updatedMembers,
        }));
    };

    const handleAddMember = () => {
        const updatedMembers = [...multiSigMembers, newMember];
        setNewMSig((prev) => ({ ...prev, members: updatedMembers }));
    };

    const handleRemoveMember = (index: number) => {
        const updatedMembers = multiSigMembers.filter((_, i) => i !== index);
        setNewMSig((prev) => ({ ...prev, members: updatedMembers }));
    };

    return (
        <StyledTableContainer>
            <Typography variant="h6" mt={4}>
                Members
            </Typography>
            <Table id="table" className="table">
                <TableHead>
                    <TableRow>
                        <TableCell style={{ width: "73%" }}>Address</TableCell>
                        <TableCell style={{ width: "12%" }}>Weight</TableCell>
                        <TableCell style={{ width: "10%" }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {multiSigMembers.map((member, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <TextField
                                    className="address"
                                    InputProps={{
                                        className: "address",
                                        endAdornment: isMemberMe(member) ? (
                                            <Chip label="me" />
                                        ) : null,
                                    }}
                                    fullWidth
                                    disabled={isMemberMe(member)}
                                    name="address"
                                    size="small"
                                    value={member.address}
                                    onChange={(e) =>
                                        handleInputChange(e, index)
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <NumberInput
                                    value={member.weight}
                                    min={1}
                                    max={100}
                                    onChange={(value) =>
                                        handleWeightUpdate(value, index)
                                    }
                                />
                            </TableCell>
                            <TableCell size="small">
                                <IconButton
                                    onClick={() => handleRemoveMember(index)}
                                    disabled={isMemberMe(member)}
                                >
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button startIcon={<Add />} onClick={handleAddMember}>
                {" "}
                Add Another
            </Button>
        </StyledTableContainer>
    );
};

export default MultiSigMemberTable;
