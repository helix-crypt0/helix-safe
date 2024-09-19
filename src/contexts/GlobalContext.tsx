import {
    Alert,
    Backdrop,
    CircularProgress,
    Container,
    Snackbar,
} from "@mui/material";
import { useAccounts, useCurrentAccount } from "@mysten/dapp-kit";
import { toB64 } from "@mysten/sui/utils";
import { BLANK_MULTISIG } from "@src/constants/constants";
import { IMultisig } from "@src/db/schema/multisig";
import { IAddressPublicKey } from "@src/db/schema/publicKey";
import { ITransaction } from "@src/db/schema/transaction";
import {
    SnackbarState,
    HelixSafeApiResponse,
} from "@src/interfaces/interfaces";
import { fetchAndSetTransactions } from "@src/util/globalContextUtil";
import { handleMSigChange } from "@src/util/multisigUtil";
import axios from "axios";
import { useRouter } from "next/router";
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface GlobalContextInterface {
    // set global loading spinner
    setIsLoadingGlobal: Dispatch<SetStateAction<boolean>>;
    // sets snackbar state
    setSnackBarState: Dispatch<SetStateAction<SnackbarState>>;
    // multisigs accounts
    multisigsAccounts: IMultisig[];
    // set multisigs accounts
    setMultisigsAccounts: Dispatch<SetStateAction<IMultisig[]>>;
    // set selected multisig account
    setSelectedMSig: Dispatch<SetStateAction<IMultisig>>;
    // selected multisig account
    selectedMSig: IMultisig;
    // transactions for selected multisig account
    transactions: ITransaction[];
    // map of transactions for all multisig accounts
    txnMap: {
        [address: string]: ITransaction[];
    };
    // set map of transactions for all multisig accounts
    setTxnMap: Dispatch<
        SetStateAction<{
            [address: string]: ITransaction[];
        }>
    >;
}

const GlobalContext = createContext<GlobalContextInterface>(
    {} as GlobalContextInterface
);

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within a GlobalProvider"
        );
    }
    return context;
}

interface GlobalProviderProps {
    children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
    const [isLoadingGlobal, setIsLoadingGlobal] = useState<boolean>(false);
    const [multisigsAccounts, setMultisigsAccounts] = useState<IMultisig[]>([]);
    const [txnMap, setTxnMap] = useState<{ [address: string]: ITransaction[] }>(
        {}
    );
    const [selectedMSig, setSelectedMSig] = useState<IMultisig>(BLANK_MULTISIG);
    const [snackbarState, setSnackBarState] = useState<SnackbarState>({
        msg: "",
        status: "success",
    });
    const accounts = useAccounts();
    const account = useCurrentAccount();
    const address = account?.address;
    const router = useRouter();
    const { msig: msigQueryParam }: { msig?: string } = router.query;

    const transactions: ITransaction[] = useMemo(() => {
        const mSigaddress = selectedMSig?.address;
        if (!mSigaddress) {
            return [];
        }
        return txnMap[mSigaddress] || [];
    }, [txnMap, selectedMSig]);

    /**
     * Reset all data
     */
    const resetData = () => {
        setMultisigsAccounts([]);
        setSelectedMSig(BLANK_MULTISIG);
        setIsLoadingGlobal(false);
        setTxnMap({});
    };

    /**
     * Update selected MSig based on query params
     * @param mSigs - multisigs to update selected msig from
     */
    const updateSelectedMSig = (mSigs: IMultisig[]) => {
        if (msigQueryParam) {
            const newMsig = mSigs.find((m) => m.address === msigQueryParam);
            if (newMsig) setSelectedMSig(newMsig);
        } else {
            if (mSigs.length > 0) {
                handleMSigChange(mSigs[0], router);
            }
        }
    };

    /**
     * Fetch multisigs and txn data
     */
    const fetchMultiSigsData = async () => {
        if (!address) {
            resetData();
            return;
        }
        setIsLoadingGlobal(true);
        // call backend to fetch multisigs based on address
        const response = await axios.post("/api/fetchMultiSigs/", { address });
        const data: HelixSafeApiResponse = response.data;
        if (!data.success || !data.data) {
            setSnackBarState({
                status: "error",
                msg: data.err || "Error fetching multisigs",
            });
            setIsLoadingGlobal(false);
            return;
        }
        const _mSigs: IMultisig[] = data.data;
        setMultisigsAccounts(_mSigs);
        updateSelectedMSig(_mSigs);
        // call backend to fetch txns for all addresses
        await fetchAndSetTransactions(_mSigs, setTxnMap);
        setIsLoadingGlobal(false);
    };

    // BEGIN USE EFFECTS
    // get multisigs and txn data
    useEffect(() => {
        console.log("address changed to", address);
        fetchMultiSigsData();
    }, [address]);

    // add any new public keys to the backend
    useEffect(() => {
        const setPKeys = async () => {
            if (accounts.length <= 0) return;
            const accountsData: IAddressPublicKey[] = accounts.map((a) => {
                return {
                    address: a.address,
                    publicKeyB64: toB64(a.publicKey),
                };
            });
            await axios.post("/api/registerPubKeys/", { accountsData });
        };
        setPKeys();
    }, [accounts]);

    // On the specified router events, start and stop the loading spinner
    useEffect(() => {
        const handleStart = () => {
            setIsLoadingGlobal(true);
        };

        const handleComplete = () => {
            setIsLoadingGlobal(false);
        };
        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    });
    // END USE EFFECTS

    const closeSnackBar = () => {
        setSnackBarState((prev) => {
            return { ...prev, msg: "" };
        });
    };

    return (
        <GlobalContext.Provider
            value={{
                setIsLoadingGlobal,
                setSnackBarState,
                multisigsAccounts,
                setMultisigsAccounts,
                selectedMSig,
                setSelectedMSig,
                transactions,
                txnMap,
                setTxnMap,
            }}
        >
            <div id="component-container" className="globalContainer">
                {children}
            </div>
            <Backdrop
                open={isLoadingGlobal}
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                }}
            >
                <CircularProgress />
            </Backdrop>
            <Snackbar
                open={Boolean(snackbarState.msg)}
                autoHideDuration={
                    snackbarState.autohideDuration ||
                    snackbarState.status === "error"
                        ? 15000
                        : 5000
                }
                onClose={closeSnackBar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    variant="filled"
                    onClose={closeSnackBar}
                    severity={snackbarState.status}
                    color={snackbarState.status}
                    sx={{ width: "100%" }}
                >
                    {snackbarState.msg}
                </Alert>
            </Snackbar>
        </GlobalContext.Provider>
    );
}
