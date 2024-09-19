import { IMultisig, MultiSigMember } from "@src/db/schema/multisig";

export const BLANK_MULTISIG: IMultisig = {
    address: "",
    members: [],
    threshold: 1,
};

export const BLANK_MULTISIG_MEMBER: MultiSigMember = {
    address: "",
    publicKeyB64: "",
    weight: 1,
};

export const CONFIRM_MSG =
    "Confirm multisig account. The account will be pending until each member accepts the invitation.";

export const SUI_VISION_URL =
    "https://testnet.suivision.xyz/account/0x8f56436a1886a6a05551279a10538f449bbd86fe8ddc66f69fd8ed6e633bc888";

export const TXN_BLOCK_RESPONSE_FAILURE = "failure";
export const MIN_SUI_BALANCE = 0.5;
export const COPY_TO_CLIPBOARD = "copy to clipboard";

export const BASE_URL = "http://localhost:3001";
