import { Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useSuiClient } from "@mysten/dapp-kit";
import {
    SuiMoveNormalizedFunction,
    SuiMoveNormalizedModule,
    SuiObjectResponse,
} from "@mysten/sui/client";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import ContractFunction from "./ContractFunction";
import StyledTxnBuilder from "./styled";
import { ChainedOutput } from "@src/interfaces/interfaces";

const TxnBuilder: React.FC = () => {
    const suiClient = useSuiClient();
    const [packageId, setPackageId] = useState<string>(
        "0xbd39ac287c62c77fafe78874342ca11b2799922227a6bff3aebb21c0e59f6a6c"
    );
    const [expandedIdx, setExpandedIdx] = useState<number>(-1);
    const [suiObjResponse, setSuiObjResponse] = useState<SuiObjectResponse>();
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [byteCode, setByteCode] = useState<unknown>();
    const [normalizedFunctions, setNormalizedFunctions] = useState<{
        [key: string]: SuiMoveNormalizedFunction;
    }>({});
    // TODO: use this instead of chained output
    //const [txb, setTxb] = useState<Transaction>();
    const [chainedOutput, setChainedOutput] = useState<ChainedOutput>();

    /**
     * Get SUI object (info on a package)
     */
    const getSuiObject = async () => {
        const obj: SuiObjectResponse = await suiClient.getObject({
            id: packageId,
            options: {
                showContent: true,
                showOwner: true,
                showPreviousTransaction: true,
                showDisplay: true,
                showBcs: true,
            },
        });
        setSuiObjResponse(obj);
        console.log("obj -", obj);
    };

    /**
     * Get normalized functions for a module
     */
    const normalize = async (moduleName: string) => {
        const smnm: SuiMoveNormalizedModule =
            await suiClient.getNormalizedMoveModule({
                package: packageId,
                module: moduleName,
            });
        const functions = smnm.exposedFunctions;
        console.log("functions =", functions);
        setNormalizedFunctions(functions);
    };

    const handleModuleClick = (
        module: string,
        content: {
            dataType: "package";
            disassembled: {
                [key: string]: unknown;
            };
        }
    ) => {
        setSelectedModule(module);
        setByteCode(content.disassembled[module]);
        normalize(module);
    };

    /**
     * render SUI package modules
     * @returns JSX
     */
    const renderModules = () => {
        if (!suiObjResponse) {
            return null;
        }
        const content = suiObjResponse.data?.content;
        const isPackage = content?.dataType === "package";
        if (!isPackage || !content) {
            return null;
        }
        const modules = Object.keys(content.disassembled);

        return (
            <Grid item md={1}>
                <Typography variant="h6">Modules</Typography>
                {modules.map((module, idx) => (
                    <Stack key={idx} direction={"row"}>
                        <Button
                            onClick={() => handleModuleClick(module, content)}
                            variant={
                                module === selectedModule ? "contained" : "text"
                            }
                        >
                            {module}
                        </Button>
                    </Stack>
                ))}
            </Grid>
        );
    };

    /**
     * render byte code
     * @returns JSX
     */
    const renderByteCode = () => {
        if (!byteCode) {
            return null;
        }
        return (
            <Grid item className="byteCodeGrid">
                <Typography variant="h6">Byte Code</Typography>
                <SyntaxHighlighter
                    language="rust"
                    showLineNumbers
                    customStyle={{ maxHeight: "1000px", maxWidth: "600px" }}
                >
                    {JSON.parse(JSON.stringify(byteCode))}
                </SyntaxHighlighter>
            </Grid>
        );
    };

    /**
     * Render module functions
     * @returns JSX
     */
    const renderFunctions = () => {
        if (Object.keys(normalizedFunctions).length <= 0) {
            return null;
        }
        const publicFns = Object.keys(normalizedFunctions).filter(
            (fn) => normalizedFunctions[fn].visibility === "Public"
        );
        return (
            <Grid item flex={1} style={{ maxWidth: 500 }}>
                <Typography variant="h6">Functions</Typography>
                {publicFns.map((func, idx) => (
                    <ContractFunction
                        idx={idx}
                        key={"contractFunction" + idx}
                        funcInfo={normalizedFunctions[func]}
                        expandedIdx={expandedIdx}
                        setExpandedIdx={setExpandedIdx}
                        functionName={func}
                        packageId={packageId}
                        moduleName={selectedModule}
                        setChainedOutput={setChainedOutput}
                        chainedOutput={chainedOutput}
                    />
                ))}
            </Grid>
        );
    };

    return (
        <StyledTxnBuilder gap={1}>
            <Stack>
                <Typography>Enter Package Id</Typography>
                <TextField
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                />
            </Stack>
            <Button
                variant="contained"
                size="small"
                onClick={getSuiObject}
                color="warning"
            >
                Get Info
            </Button>
            <Grid container direction={"row"} gap={2} mt={2} maxWidth={"100%"}>
                {renderModules()}
                {renderByteCode()}
                {renderFunctions()}
            </Grid>
        </StyledTxnBuilder>
    );
};

export default TxnBuilder;
