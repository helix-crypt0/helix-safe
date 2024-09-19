import { styled, Stack } from "@mui/material";

const StyledAssets = styled(Stack)(({ theme }) => {
    return {
        ".card": {
            justifyContent: "space-between",
            display: "flex",
            flexDirection: "column",
            width: "300px",
        },
        ".cardContent": {
            wordWrap: "break-word",
        },
        ".transfer": {
            width: "100%",
        },
    };
});

export default StyledAssets;
