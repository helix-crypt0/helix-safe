import { styled } from "@mui/material";
import { slightGrey } from "./colorConstants";
//export const slightBorder = `solid 1px ${borderGrey}`;
export const addressStyle = {
    cursor: "pointer",
    "&:hover": { fontWeight: "bold" },
};

const GlobalStylesContainer = styled("div")(({ theme }) => {
    return {
        ".globalContainer": {
            // minHeight: "100vh",
            // maxWidth: "100vw",
            paddingTop: "90px",
            overflow: "scroll",
            [theme.breakpoints.down("sm")]: {
                margin: theme.spacing(1),
            },
            [theme.breakpoints.down("md")]: {
                margin: theme.spacing(2),
            },
            marginLeft: theme.spacing(4),
            marginRight: theme.spacing(4),
            marginBottom: theme.spacing(6),
        },
        ".pageGridContainer": {
            padding: theme.spacing(5),
            maxWidth: "100vw",
        },
        ".address": {
            addressStyle,
        },
        ///// GRID SPACING /////
        ".space-around": {
            justifyContent: "space-around",
            alignItems: "center",
            display: "flex",
        },
        ".space-between": {
            justifyContent: "space-between",
            alignItems: "center",
            display: "flex",
        },
        ".centered": {
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
        },
        ".verticalCentered": {
            alignItems: "center",
            display: "flex",
        },
        ".centeredColumn": {
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            display: "flex",
        },
        ".horizontalCenteredColumn": {
            flexDirection: "column",
            alignItems: "center",
            display: "flex",
        },
        ///// END  GRID SPACING /////

        ///// TEXT
        ".slightText": {
            color: slightGrey,
            fontSize: "0.9rem",
        },
    };
});

export default GlobalStylesContainer;
