import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Stack,
} from "@mui/material";
import { IMultisig } from "@src/db/schema/multisig";
import MultiSigRow from "./MultiSigRow";

interface MultiSigTableProps {
    multisigs: IMultisig[];
}

const MultiSigTable: React.FC<MultiSigTableProps> = ({ multisigs }) => {
    return (
        <Stack sx={{ width: "100%" }}>
            <Typography variant="h6"> Multisig Accounts</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={"15%"}>Address</TableCell>
                            <TableCell width={"15%"}>Name</TableCell>
                            <TableCell width={"15%"}>Description</TableCell>
                            <TableCell width={"10%"}>Threshold</TableCell>
                            <TableCell>Members</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {multisigs.map((multisig, index) => (
                            <MultiSigRow key={index} multisig={multisig} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
};

export default MultiSigTable;
