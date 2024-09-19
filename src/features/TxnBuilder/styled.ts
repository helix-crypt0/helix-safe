import { styled, Stack } from "@mui/material";

const StyledTxnBuilder = styled(Stack)(({ theme }) => {
    return {
        maxWidth: "100%",
        ".byteCodeGrid": {
            maxWidth: "55%",
            [theme.breakpoints.down("lg")]: {
                maxWidth: "60%",
            },
        },
    };
});

export default StyledTxnBuilder;
