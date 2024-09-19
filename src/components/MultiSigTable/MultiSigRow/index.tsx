import { IMultisig } from "@src/db/schema/multisig";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    Radio,
} from "@mui/material";
import MultiSigMembersRow from "../MultiSigMembersRow";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { useRouter } from "next/router";
import { handleMSigChange } from "@src/util/multisigUtil";
import SuiAddress from "@src/components/SuiAddress";

interface Props {
    multisig: IMultisig;
}
const MultiSigRow: React.FC<Props> = ({ multisig }) => {
    const { selectedMSig } = useGlobalContext();
    const isSelected = selectedMSig.address === multisig.address;
    const router = useRouter();

    return (
        <TableRow sx={{ backgroundColor: isSelected ? "lightblue" : "" }}>
            <TableCell>
                {multisig.address ? (
                    <Typography>
                        <Radio
                            checked={selectedMSig.address === multisig.address}
                            onChange={() => handleMSigChange(multisig, router)}
                            value={multisig.address}
                            size="small"
                        />
                        <SuiAddress address={multisig.address} />
                    </Typography>
                ) : (
                    "Pending Accepted Invitations"
                )}
            </TableCell>
            <TableCell>{multisig.name || "N/A"}</TableCell>
            <TableCell>{multisig.description || "N/A"}</TableCell>
            <TableCell>{multisig.threshold}</TableCell>
            <TableCell>
                <Table>
                    <TableBody>
                        <MultiSigMembersRow multisig={multisig} />
                    </TableBody>
                </Table>
            </TableCell>
        </TableRow>
    );
};

export default MultiSigRow;
