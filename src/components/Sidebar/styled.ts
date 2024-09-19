import { styled, Drawer, lighten } from "@mui/material";

export const linkStyle = {
    textDecoration: "none",
    width: "100%",
    justifyContent: "center",
    display: "flex",
};

const StyledSideBar = styled(Drawer)(({ theme }) => {
    return {
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            boxSizing: "border-box",
        },
        ".selectedPage": {
            backgroundColor: lighten(theme.palette.primary.main, 0.9),
        },
        ".link": {
            color: "rgba(0, 0, 0, 0.87)",
        },
    };
});

export default StyledSideBar;
