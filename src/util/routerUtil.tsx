import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import WalletIcon from "@mui/icons-material/Wallet";

export interface NavItem {
    path: string;
    name: string;
    icon?: React.ReactNode;
}
export const CREATE_TXN_ROUTE: NavItem = {
    path: `/create`,
    name: "New Transaction",
};

export const TXN_ROUTE: NavItem = {
    path: `/transactions`,
    name: "Transactions",
    icon: <SwapHorizIcon />,
};

export const ASSETS_ROUTE: NavItem = {
    path: `/assets`,
    name: "Assets",
    icon: <WalletIcon />,
};

export const NAV_ITEMS: NavItem[] = [TXN_ROUTE, ASSETS_ROUTE];

export const getPathWithMsigAddress = (
    path: string,
    address: string,
): string => {
    return `${path}?msig=${address}`;
};
