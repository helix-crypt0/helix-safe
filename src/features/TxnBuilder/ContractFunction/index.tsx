import { ExpandMore } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    SuiMoveAbilitySet,
    SuiMoveNormalizedFunction,
    SuiMoveNormalizedType,
} from "@mysten/sui/client";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import FunctionInput from "../FunctionInput";
import { Transaction } from "@mysten/sui/transactions";
import {
    buildSuiTxn,
    createTxnInDB,
    getArg,
    getArgsFromParams,
    simulateWriteTxn,
} from "@src/util/suiUtil";
import { toB64 } from "@mysten/sui/utils";
import {
    useCurrentAccount,
    useSignTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import { ChainedOutput } from "@src/interfaces/interfaces";
import { ITransaction } from "@src/db/schema/transaction";
import { getWeightForAddressFromMSig } from "@src/util/multisigUtil";

interface Props {
    functionName: string;
    funcInfo: SuiMoveNormalizedFunction;
    idx: number;
    expandedIdx: number;
    setExpandedIdx: Dispatch<SetStateAction<number>>;
    packageId: string;
    moduleName: string;
    chainedOutput: ChainedOutput | undefined;
    setChainedOutput: Dispatch<SetStateAction<ChainedOutput | undefined>>;
}
const ContractFunction: React.FC<Props> = ({
    functionName,
    funcInfo,
    idx,
    expandedIdx,
    setExpandedIdx,
    packageId,
    moduleName,
    chainedOutput,
    setChainedOutput,
}) => {
    const {
        setIsLoadingGlobal,
        setSnackBarState,
        selectedMSig,
        setTxnMap,
        transactions,
        txnMap,
    } = useGlobalContext();
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const [txnName, setTxnName] = useState<string>("");

    const address = currentAccount?.address;
    const [args, setArgs] = useState<{ value: any; type: string }[]>([]);
    const params: SuiMoveNormalizedType[] = useMemo(
        () => funcInfo.parameters,
        [funcInfo.parameters],
    );
    const _typeParams: SuiMoveAbilitySet[] = useMemo(
        () => funcInfo.typeParameters,
        [funcInfo.typeParameters],
    );
    const [typeParams, setTypeParams] = useState<string[]>(
        _typeParams.map((type) => ""),
    );
    const [chainedOutputTxn, setChainedOutputTxn] = useState<
        Transaction | undefined
    >();
    const suiClient = useSuiClient();

    const resetOnSuccess = () => {
        setArgs(getArgsFromParams(params));
        setTxnName("");
        setTypeParams(_typeParams.map((type) => ""));
    };

    /**
     * Build transaction
     */
    const buildTxn = async (getOutputOnly?: boolean) => {
        setIsLoadingGlobal(true);
        try {
            const txn = chainedOutputTxn || new Transaction();
            const filteredArgs = args.filter(
                (a) => a.value !== "" && a.value !== undefined,
            );
            const functionArgs = filteredArgs.map((a) =>
                getArg(txn, a.type, a.value),
            );

            txn.setSender(selectedMSig.address);
            const result = await buildSuiTxn(
                txn,
                functionName,
                moduleName,
                packageId,
                functionArgs,
                typeParams,
            );

            if (getOutputOnly) {
                setChainedOutput({
                    functionName,
                    packageId,
                    value: result,
                    txn,
                });
                setIsLoadingGlobal(false);

                return;
            }
            const bytes = await txn.build({ client: suiClient });
            console.log(toB64(bytes));
            return await signAndCreateTxn(txn, bytes);
        } catch (error: any) {
            console.error(error);
            setSnackBarState({
                msg: error.message,
                status: "error",
            });
        } finally {
            setIsLoadingGlobal(false);
        }
    };

    /**
     * Get signature from multisig signer
     */
    const signAndCreateTxn = async (txn: Transaction, bytes: Uint8Array) => {
        if (!address) return;
        console.log("selected msig address ", selectedMSig.address);
        setIsLoadingGlobal(true);
        try {
            //run dry run first to make sure txn won't fail
            const dryRunSuccess = await simulateWriteTxn(
                txn,
                address,
                suiClient,
                setSnackBarState,
            );
            if (!dryRunSuccess) {
                setIsLoadingGlobal(false);
                return;
            }

            txn.setSender(selectedMSig.address); // multisig account
            const { signature } = await signTransaction({
                transaction: txn,
            });
            const newDbTxn: ITransaction = {
                name: txnName || functionName,
                multisigAddress: selectedMSig.address,
                bytesB64: toB64(bytes),
                signatures: [
                    {
                        signature,
                        weight: getWeightForAddressFromMSig(
                            selectedMSig,
                            address,
                        ),
                        address: address,
                        timestamp: Date.now(),
                    },
                ],
            };
            const txnResponse = await createTxnInDB(newDbTxn, setSnackBarState);
            if (!txnResponse) return;
            setTxnMap({
                ...txnMap,
                [selectedMSig.address]: [...transactions, txnResponse],
            });
            setSnackBarState({
                status: "success",
                msg: "Transaction proposed successfully",
            });
            resetOnSuccess();
        } catch (e) {
            const errMsg = `Unable to propose txn: ${e}`;
            console.error(errMsg);
            setSnackBarState({
                status: "error",
                msg: errMsg,
            });
        } finally {
            setIsLoadingGlobal(false);
        }
    };

    /**
     * Hanlde expanding function accordion
     * @param event - event object
     * @param expanded - expanded state
     * @param params - function parameters
     * @param funcName - function name
     * @param idx - index of function within module
     */
    const handleExpanded = (
        event: React.SyntheticEvent,
        expanded: boolean,
        idx: number,
    ) => {
        if (expanded) {
            params.map((param) => console.log("type -", param));
            setArgs(getArgsFromParams(params));
            setExpandedIdx(idx);
        } else {
            setExpandedIdx(-1);
            setArgs([]);
        }
    };

    /**
     * Render type
     * @param idx - type index
     * @returns JSX
     */
    const renderType = (idx: number) => {
        return (
            <Stack mt={1} key={"type" + idx}>
                <Typography>Type{idx}</Typography>
                <TextField
                    size="small"
                    multiline
                    placeholder={`Ty${idx}`}
                    value={typeParams[idx]}
                    onChange={(e) => {
                        const newTypeParams = [...typeParams];
                        newTypeParams[idx] = e.target.value;
                        setTypeParams(newTypeParams);
                    }}
                />
            </Stack>
        );
    };

    return (
        <Accordion
            sx={{ maxWidth: "100%" }}
            key={functionName}
            expanded={expandedIdx === idx}
            onChange={(e, expanded) => handleExpanded(e, expanded, idx)}
        >
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ bgcolor: expandedIdx === idx ? "lightblue" : "" }}
            >
                <Typography>{functionName}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ maxWidth: "100%", overflow: "scroll" }}>
                <Box mb={2}>
                    {_typeParams.map((typeParam, i) => renderType(i))}
                </Box>
                {params.map((param, idx) => (
                    <FunctionInput
                        type={param}
                        index={idx}
                        args={args}
                        setArgs={setArgs}
                        key={"fcnInput" + idx}
                        chainedOutput={chainedOutput}
                        setChainedOutputTxn={setChainedOutputTxn}
                    />
                ))}
                {/* <Button
          onClick={() => {
            console.log("args -", args);
          }}
        >
          test
        </Button> */}
                <Stack mb={2}>
                    <Typography>Txn Name (optional)</Typography>
                    <TextField
                        value={txnName}
                        size="small"
                        placeholder="i.e.Update Deposit Fee"
                        onChange={(e) => setTxnName(e.target.value)}
                    />
                </Stack>
                <Button
                    onClick={() => buildTxn()}
                    variant="contained"
                    color="success"
                >
                    Propose Txn
                </Button>
                {/* <Button
          onClick={() => buildTxn(true)}
          variant="contained"
          color="secondary"
          sx={{ ml: 1 }}
        >
          Add to Txn Block
        </Button> */}
            </AccordionDetails>
        </Accordion>
    );
};

export default ContractFunction;
