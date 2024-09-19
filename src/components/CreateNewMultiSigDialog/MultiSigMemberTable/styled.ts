import { styled, TableContainer } from "@mui/material";

const StyledTableContainer = styled(TableContainer)(({ theme }) => {
    return {
        ".table": {
            maxWidth: "100%",
            tableLayout: "fixed",
        },
        ".weight": {
            "& input": {
                textAlign: "center",
            },
        },
        ".address": {
            "& input": {
                fontSize: "0.9em",
            },
        },
    };
});

export default StyledTableContainer;
