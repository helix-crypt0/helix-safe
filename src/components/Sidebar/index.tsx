import {
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useGlobalContext } from "@src/contexts/GlobalContext";
import PixelAvatar from "../PixelAvatar";
import theme from "@src/styles/theme";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AccountsDrawer from "../AccountsDrawer";
import { useState } from "react";
import NextLink from "next/link";
import { getThresholdAndWeight } from "@src/util/multisigUtil";
import {
    CREATE_TXN_ROUTE,
    getPathWithMsigAddress,
    NAV_ITEMS,
} from "@src/util/routerUtil";
import StyledSideBar, { linkStyle } from "./styled";
import { useRouter } from "next/router";
import SuiAddress from "../SuiAddress";

const drawerWidth = 240;

const Sidebar: React.FC = () => {
    const { selectedMSig } = useGlobalContext();
    const signedIn = selectedMSig._id;
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const renderSelected = () => {
        if (signedIn) {
            return (
                <Badge
                    badgeContent={getThresholdAndWeight(selectedMSig)}
                    color="primary"
                    overlap="circular"
                >
                    <PixelAvatar address={selectedMSig.address} />
                </Badge>
            );
        } else {
            return (
                <Button
                    onClick={() => setOpen(true)}
                    variant="contained"
                    size="small"
                    color="secondary"
                >
                    Log In
                </Button>
            );
        }
    };

    return (
        <>
            <StyledSideBar
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: "auto", pt: theme.spacing(2) }}>
                    <List>
                        <ListItem sx={{ justifyContent: "space-between" }}>
                            {renderSelected()}
                            <Stack ml={2} mr={2}>
                                <SuiAddress address={selectedMSig.address} />
                                {selectedMSig.name && (
                                    <Typography variant="subtitle2">
                                        {selectedMSig.name.slice(0, 20)}
                                    </Typography>
                                )}
                            </Stack>
                            <IconButton
                                size="small"
                                onClick={() => setOpen(true)}
                                sx={{ float: "right" }}
                            >
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </ListItem>
                        {signedIn && (
                            <NextLink
                                href={getPathWithMsigAddress(
                                    CREATE_TXN_ROUTE.path,
                                    selectedMSig.address,
                                )}
                                style={linkStyle}
                            >
                                <Button
                                    sx={{ width: "100%", m: 2 }}
                                    variant="contained"
                                    size="small"
                                >
                                    {CREATE_TXN_ROUTE.name}
                                </Button>
                            </NextLink>
                        )}
                    </List>
                    <Divider />
                    {signedIn && (
                        <List>
                            {NAV_ITEMS.map((item, index) => (
                                <NextLink
                                    key={item.name}
                                    href={getPathWithMsigAddress(
                                        item.path,
                                        selectedMSig.address,
                                    )}
                                    style={linkStyle}
                                >
                                    <ListItem
                                        classes={{ root: "link" }}
                                        disablePadding
                                        className={
                                            router.pathname === item.path
                                                ? "selectedPage"
                                                : ""
                                        }
                                    >
                                        <ListItemButton>
                                            <ListItemIcon>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} />
                                        </ListItemButton>
                                    </ListItem>
                                </NextLink>
                            ))}
                        </List>
                    )}
                </Box>
            </StyledSideBar>
            <AccountsDrawer open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default Sidebar;
