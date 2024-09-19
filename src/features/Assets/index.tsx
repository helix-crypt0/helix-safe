import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSignTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { SuiObjectResponse } from "@mysten/sui/client";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import {
    createTxnInDB,
    formatSuiType,
    simulateWriteTxn,
} from "@src/util/suiUtil";
import { useEffect, useState } from "react";
import StyledAssets from "./styled";
import TransferDialog from "./TransferDialog";
import { Transaction } from "@mysten/sui/transactions";
import SuiAddress from "@src/components/SuiAddress";
import { ITransaction } from "@src/db/schema/transaction";
import { getWeightForAddressFromMSig } from "@src/util/multisigUtil";
import { toB64 } from "@mysten/sui/utils";

const Assets: React.FC = () => {
    const {
        selectedMSig,
        setIsLoadingGlobal,
        setSnackBarState,
        setTxnMap,
        txnMap,
        transactions,
    } = useGlobalContext();
    const suiClient = useSuiClient();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;
    const isConnected = !!address;
    const { mutate: signAndExecuteTransaction } =
        useSignAndExecuteTransaction();
    const [objects, setObjects] = useState<SuiObjectResponse[]>([]);
    const [objId, setObjId] = useState("");

    useEffect(() => {
        const fetchObjects = async () => {
            if (!selectedMSig.address) return setObjects([]);
            const objs = await suiClient.getOwnedObjects({
                owner: selectedMSig.address,
                options: {
                    showContent: true,
                    showType: true,
                    showDisplay: true,
                },
                // options: { showType: true },
            });
            console.log("objs -", objs);
            setObjects(objs.data);
        };
        fetchObjects();
    }, [selectedMSig, suiClient]);

    useEffect(() => {
        console.log("objects -", objects);
    }, [objects]);

    //   const transferObject = (address: string) => {
    //     console.log("address -", address);
    //   };
    async function transferOwnership(address: string, objId: string) {
        if (!address) {
            return;
        }
        if (!isConnected) {
            const errMsg = "Wallet not connected";
            console.error(errMsg);
            setSnackBarState({ msg: errMsg, status: "error" });
            return;
        }
        setIsLoadingGlobal(true);
        const txn = new Transaction();
        txn.setSender(selectedMSig.address);
        try {
            txn.transferObjects([objId], address);
            // run dry run first to make sure txn won't fail
            const dryRunSuccess = await simulateWriteTxn(
                txn,
                address,
                suiClient,
                setSnackBarState,
            );
            if (!dryRunSuccess) {
                return;
            }

            const bytes = await txn.build({ client: suiClient });
            await signAndCreateTxn(txn, bytes);
        } catch (e: any) {
            const errMsg = `Unable to transfer: ${e}`;
            console.error(errMsg);
            setSnackBarState({ msg: errMsg, status: "error" });
            return;
        } finally {
            setIsLoadingGlobal(false);
        }
    }

    const signAndCreateTxn = async (txn: Transaction, bytes: Uint8Array) => {
        if (!address) return;
        console.log("selected msig address ", selectedMSig.address);
        setIsLoadingGlobal(true);

        const { signature } = await signTransaction({
            transaction: txn,
        });
        const newTxnDB: ITransaction = {
            multisigAddress: selectedMSig.address,
            bytesB64: toB64(bytes),
            signatures: [
                {
                    signature,
                    weight: getWeightForAddressFromMSig(selectedMSig, address),
                    address: address,
                    timestamp: Date.now(),
                },
            ],
        };
        const txnResponse = await createTxnInDB(newTxnDB, setSnackBarState);
        if (!txnResponse) return;
        setTxnMap({
            ...txnMap,
            [selectedMSig.address]: [...transactions, txnResponse],
        });
        setSnackBarState({
            status: "success",
            msg: "Transaction proposed successfully",
        });
    };

    return (
        <StyledAssets>
            <Typography variant="h5">Assets</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {objects.map((obj) => (
                    <Card key={obj.data?.objectId} className="card">
                        <CardContent className="cardContent">
                            <Stack direction="column" spacing={1}>
                                <Stack>
                                    <Typography fontWeight={"bold"}>
                                        Object ID
                                    </Typography>
                                    <SuiAddress
                                        address={obj.data?.objectId || ""}
                                    />
                                </Stack>
                                <Stack>
                                    <Typography fontWeight={"bold"}>
                                        Type
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatSuiType(obj.data?.type || "")}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                fullWidth
                                className="transfer"
                                onClick={() =>
                                    setObjId(obj.data?.objectId || "")
                                }
                            >
                                Transfer
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>
            <TransferDialog
                objId={objId}
                onClose={() => setObjId("")}
                onSend={transferOwnership}
            />
        </StyledAssets>
    );
};
export default Assets;
