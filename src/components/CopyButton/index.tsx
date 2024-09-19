import { Button } from "@mui/material";
import { handleCopy } from "@src/util/util";
import { Dispatch, SetStateAction } from "react";
import { Check, ContentCopy } from "@mui/icons-material";

interface Props {
    txtToCopy: string;
    copied: boolean;
    setCopied: Dispatch<SetStateAction<boolean>>;
}
const CopyButton: React.FC<Props> = ({ txtToCopy, copied, setCopied }) => {
    return (
        <Button
            variant="text"
            color={"info"}
            size="small"
            sx={{ marginLeft: 1, padding: "2px", minWidth: "0" }}
            onClick={() => handleCopy(txtToCopy, setCopied)}
        >
            {copied ? (
                <Check sx={{ width: "20px", height: "20px" }} />
            ) : (
                <ContentCopy sx={{ width: "20px", height: "20px" }} />
            )}
        </Button>
    );
};

export default CopyButton;
