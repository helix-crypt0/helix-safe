import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import { SuiMoveNormalizedType } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { formatAddress } from "@mysten/sui/utils";
import { ChainedOutput } from "@src/interfaces/interfaces";
import React, { Dispatch, SetStateAction, useState } from "react";

interface Props {
    args: {
        value: any;
        type: string;
    }[];
    setArgs: React.Dispatch<
        React.SetStateAction<{ value: any; type: string }[]>
    >;
    type: SuiMoveNormalizedType;
    index: number;
    setChainedOutputTxn: Dispatch<SetStateAction<Transaction | undefined>>;
    prefix?: string;
    chainedOutput?: ChainedOutput;
}
const FunctionInput: React.FC<Props> = React.memo(
    ({
        type,
        index,
        prefix,
        args,
        setArgs,
        chainedOutput,
        setChainedOutputTxn,
    }) => {
        const handleChainedOutput = () => {
            if (!chainedOutput) return;
            const newArgs = [...args];
            newArgs[index] = {
                value: chainedOutput.value,
                type: "chainedOutput",
            };
            setArgs(newArgs);
            setChainedOutputTxn(chainedOutput.txn);
        };

        /**
         * Get input params for function
         * @returns string
         */
        const getInputParams = (): {
            placeholder: string;
            label: string;
            objectType: string;
            textFieldtype?: string;
        } => {
            if (typeof type === "string") {
                const textFieldtype = ["Address", "Signer"].includes(type)
                    ? "text"
                    : "number";
                return {
                    placeholder: type,
                    label: `Arg${index}: ${prefix || ""}${type}`,
                    objectType: type,
                    textFieldtype,
                };
            }

            if (typeof type === "object" && "Struct" in type) {
                return {
                    placeholder: `${formatAddress(type.Struct.address)}::${
                        type.Struct.module
                    }::${type.Struct.name}`,
                    label: `Arg${index}: ${prefix || ""}${type.Struct.name}`,
                    objectType: "object",
                    textFieldtype: "text",
                };
            }
            if (typeof type === "object" && "TypeParameter" in type) {
                return {
                    placeholder: `Type Parameter ${type.TypeParameter}`,
                    label: `Arg${index}: Type${type.TypeParameter}`,
                    objectType: "object",
                    textFieldtype: "text",
                };
            }
            return {
                placeholder: "",
                label: "",
                objectType: "",
                textFieldtype: "",
            };
        };
        const { placeholder, label, objectType, textFieldtype } =
            getInputParams();

        /**
         * renders input for function
         * @returns JSX
         */
        const renderInput = () => {
            return (
                <Box key={index} mb={2}>
                    <Typography>{label}</Typography>
                    <TextField
                        multiline
                        placeholder={placeholder}
                        type={textFieldtype}
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={args[index]?.value || ""}
                        onChange={(e) => {
                            const newArgs = [...args];
                            newArgs[index] = {
                                value: e.target.value,
                                type: objectType,
                            };
                            setArgs(newArgs);
                        }}
                        // InputProps={{
                        //   endAdornment: chainedOutput ? (
                        //     <Button onClick={handleChainedOutput}>
                        //       Use Chained Output
                        //     </Button>
                        //   ) : null,
                        // }}
                    />
                </Box>
            );
        };

        switch (typeof type) {
            case "string":
                switch (type) {
                    case "Bool":
                        return (
                            <Box key={index} mb={2}>
                                <Typography>
                                    Arg{index}: {type}
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox size="small" />}
                                    label={
                                        args[index]?.value ? "True" : "False"
                                    }
                                    value={args[index]?.value || false}
                                    onChange={(e, checked) => {
                                        const newArgs = [...args];
                                        newArgs[index] = {
                                            value: checked,
                                            type,
                                        };
                                        setArgs(newArgs);
                                    }}
                                />
                            </Box>
                        );
                    case "U8":
                    case "U16":
                    case "U32":
                    case "U64":
                    case "U128":
                    case "U256":
                    case "Address":
                    case "Signer":
                        return renderInput();
                    default:
                        return null;
                }
            case "object":
                if ("Struct" in type) {
                    return renderInput();
                } else if ("Vector" in type) {
                    return (
                        <FunctionInput
                            type={type.Vector}
                            index={index}
                            args={args}
                            setArgs={setArgs}
                            chainedOutput={chainedOutput}
                            setChainedOutputTxn={setChainedOutputTxn}
                        />
                    );
                } else if ("TypeParameter" in type) {
                    return renderInput();
                } else if ("Reference" in type) {
                    return (
                        <FunctionInput
                            type={type.Reference}
                            index={index}
                            args={args}
                            setArgs={setArgs}
                            prefix="&"
                            chainedOutput={chainedOutput}
                            setChainedOutputTxn={setChainedOutputTxn}
                        />
                    );
                } else if ("MutableReference" in type) {
                    return (
                        <FunctionInput
                            type={type.MutableReference}
                            index={index}
                            args={args}
                            setArgs={setArgs}
                            prefix="&mut "
                            chainedOutput={chainedOutput}
                            setChainedOutputTxn={setChainedOutputTxn}
                        />
                    );
                }
                return null;
            default:
                return null;
        }
    },
);
FunctionInput.displayName = "FunctionInput";

export default FunctionInput;
