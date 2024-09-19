import { styled, Stack } from "@mui/material";
import { hexToRgba } from "@src/util/util";

const StyledTransactions = styled(Stack)(({ theme }) => {
    return {
        ".txnStack": {
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1),
            cursor: "pointer",
            "&:hover": {
                backgroundColor: hexToRgba(theme.palette.primary.light, 0.2),
            },
        },
    };
});

export default StyledTransactions;
