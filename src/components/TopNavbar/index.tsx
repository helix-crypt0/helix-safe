import React from "react";
import { Toolbar, Grid, Stack, Button, Typography } from "@mui/material";
import StyledAppBar from "./styled";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { NavItem } from "@src/util/routerUtil";

const navItems: NavItem[] = [];

const TopNavbar: React.FC = () => {
    const router = useRouter();
    /**
     * Renders pages for navbar
     * @returns JSX
     */
    function renderNavItems() {
        return navItems.map((navItem) => {
            const routerPath = router.asPath;
            let isCurrPage = routerPath.indexOf(navItem.path) !== -1;

            return (
                <NextLink
                    //  onClick={() => router.push(`${navItem.path}`)}
                    key={navItem.name}
                    href={navItem.path}
                    style={{ textDecoration: "none" }}
                >
                    <Typography
                        className={`navItem ${
                            isCurrPage ? "activeNavItem" : ""
                        }`}
                    >
                        {" "}
                        {navItem.name}
                    </Typography>
                </NextLink>
            );
        });
    }
    return (
        <StyledAppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}>
            <Toolbar disableGutters className="toolbar">
                <Grid container className="navBarContainer">
                    <Button
                        variant="text"
                        className="logo"
                        // onClick={() => router.push("/")}
                    >
                        Helix Safe
                    </Button>
                    {renderNavItems()}
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        <ConnectButton
                            style={{
                                cursor: "pointer",
                                paddingTop: 6,
                                paddingBottom: 6,
                            }}
                        />
                    </Stack>
                </Grid>
            </Toolbar>
        </StyledAppBar>
    );
};

export default TopNavbar;
