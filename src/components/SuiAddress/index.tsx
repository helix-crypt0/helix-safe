import { Tooltip, Typography, TypographyProps } from "@mui/material";
import { useState } from "react";
import { COPY_TO_CLIPBOARD } from "@src/constants/constants";
import { addressStyle } from "@src/styles/globalClasses";
import { handleTooltipCopy } from "@src/util/util";
import { formatAddress } from "@mysten/sui/utils";

interface SuiAddressProps extends TypographyProps {
    address: string;
    showFull?: boolean;
}

const SuiAddress = ({ address, showFull, ...rest }: SuiAddressProps) => {
    const [tooltipText, setTooltipText] = useState(COPY_TO_CLIPBOARD);

    return (
        <Tooltip title={tooltipText} arrow placement="top-start">
            <Typography
                variant="subtitle2"
                component="span"
                sx={addressStyle}
                onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                    handleTooltipCopy(e, address, setTooltipText);
                }}
                onPointerOver={() => setTooltipText(COPY_TO_CLIPBOARD)}
                {...rest}
            >
                {showFull ? address : formatAddress(address)}
            </Typography>
        </Tooltip>
    );
};

export default SuiAddress;
