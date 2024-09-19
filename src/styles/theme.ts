import { createTheme } from "@mui/material/styles";
import { text } from "stream/consumers";

// Create a theme instance.
const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    width: "fit-content",
                    height: "fit-content",
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    // Hides the scrollbar
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    "& *": {
                        // Hides the scrollbar for all elements in Webkit browsers and Firefox
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    },
                },
            },
        },
        MuiInput: {
            styleOverrides: {
                root: {
                    paddingLeft: "10px",
                },
            },
        },
        MuiGrid: {
            styleOverrides: {
                root: {
                    margin: "0px",
                    maxWidth: "none",
                    "&.MuiGrid-item": {
                        maxWidth: "100%",
                    },
                },
                item: { paddingLeft: "0px", paddingTop: "0px" },
                container: { maxWidth: "100%" },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: { maxWidth: "100%" },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: "5px",
                },
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: "8px",
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    "& input ": {
                        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                            {
                                WebkitAppearnace: "none",
                                display: "none",
                            },
                        "&.Mui-disabled": {},
                    },
                },
            },
        },
    },
});

export default theme;
