import { styled, Box, Drawer, colors } from "@mui/material";

const StyledDrawer = styled(Drawer)(({ theme }) => {
    return {
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            boxSizing: "border-box",
        },
        ".msigStack": {
            flexDirection: "row",
            alignItems: "center",
            cursor: "pointer",
            "&:hover": {
                backgroundColor: colors.grey[200],
            },
        },
    };
});

export default StyledDrawer;
