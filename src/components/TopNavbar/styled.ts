import { styled, Box, AppBar, colors } from "@mui/material";

const StyledAppBar = styled(AppBar)(({ theme }) => {
    return {
        position: "fixed",
        opacity: ".92",
        padding: "5px 30px 5px 30px",
        [theme.breakpoints.down("md")]: {
            padding: "2px 15px 2px 15px",
        },
        ".logo": {
            color: "white",
        },
        ".logoDivider": {
            padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
        },
        ".toolbar": {
            maxHeight: "fit-content",
            minHeight: "20px",
            padding: "5px",
        },
        ".navBarContainer": {
            justifyContent: "space-between",
            flexDirection: "row",
        },
        ".logoAndPages": {
            width: "fit-content",
            alignItems: "center",
            display: "flex",
            justifyContent: "start",
            gap: theme.spacing(1),
        },
        ".navItem": {
            color: "white",
            display: "flex",
            padding: "var(--padding-margins-xs, 10px) 16px",
            justifyContent: "center",
            alignItems: "center",
            gap: "var(--padding-margins-xs, 10px)",
            borderRadius: theme.spacing(1),
        },
        ".activeNavItem": {
            background: "black",
        },
    };
});

export default StyledAppBar;
