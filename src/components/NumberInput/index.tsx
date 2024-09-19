import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton, { IconButtonOwnProps } from "@mui/material/IconButton";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Stack } from "@mui/material";

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    min = 0,
    max,
}) => {
    const btnSx: IconButtonOwnProps["sx"] = {
        width: "12px",
        height: "16px",
    };
    const handleIncrement = () => {
        if (max === undefined || value < max) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    return (
        <TextField
            type="number"
            size="small"
            value={value}
            onChange={(e) => {
                const newValue = parseInt(e.target.value, 10);
                if (
                    !isNaN(newValue) &&
                    (max === undefined || newValue <= max)
                ) {
                    onChange(newValue >= min ? newValue : min);
                }
            }}
            InputProps={{
                inputProps: {
                    min,
                    max,
                    readOnly: true, // Prevent typing manually
                },
                endAdornment: (
                    <InputAdornment position="end">
                        <Stack>
                            <IconButton
                                size="small"
                                sx={btnSx}
                                onClick={handleIncrement}
                            >
                                <ArrowDropUpIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleDecrement}
                                sx={btnSx}
                            >
                                <ArrowDropDownIcon />
                            </IconButton>
                        </Stack>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default NumberInput;
