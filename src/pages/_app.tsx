import React from "react"; // Import React
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import "@mysten/dapp-kit/dist/index.css";
import { CssBaseline } from "@mui/material";
import theme from "../styles/theme";
import { GlobalProvider } from "@src/contexts/GlobalContext";
import {
    createNetworkConfig,
    SuiClientProvider,
    WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalStylesContainer from "@src/styles/globalClasses";
import dynamic from "next/dynamic";
import Sidebar from "@src/components/Sidebar";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    // don't server-side render the navbar
    const TopNavbar = dynamic(() => import("@src/components/TopNavbar"), {
        ssr: false,
    });

    // dynamically import SuiClientProvider and WalletProvider to avoid SSR
    const SuiClientProviderNoSSR = dynamic(
        () => import("@mysten/dapp-kit").then((mod) => mod.SuiClientProvider),
        { ssr: false },
    );
    const WalletProviderNoSSR = dynamic(
        () => import("@mysten/dapp-kit").then((mod) => mod.WalletProvider),
        { ssr: false },
    );
    // Config options for the networks you want to connect to
    const { networkConfig } = createNetworkConfig({
        //	localnet: { url: getFullnodeUrl('localnet') },
        testnet: { url: getFullnodeUrl("testnet") },
        // devnet: { url: getFullnodeUrl("devnet") },
        //mainnet: { url: getFullnodeUrl('mainnet') },
    });
    const queryClient = new QueryClient();
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <SuiClientProviderNoSSR
                        networks={networkConfig}
                        defaultNetwork="testnet"
                    >
                        <WalletProviderNoSSR autoConnect>
                            <CssBaseline />
                            <GlobalStylesContainer>
                                <GlobalProvider>
                                    <TopNavbar />
                                    <div
                                        style={{
                                            display: "flex",
                                            height: "100vh",
                                        }}
                                    >
                                        <Sidebar />
                                        <div style={{ flexGrow: 1 }}>
                                            <Component {...pageProps} />
                                        </div>
                                    </div>
                                </GlobalProvider>
                            </GlobalStylesContainer>
                        </WalletProviderNoSSR>
                    </SuiClientProviderNoSSR>
                </QueryClientProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
