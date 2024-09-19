import { IMultisig } from "@src/db/schema/multisig";
import { NextRouter } from "next/router";
import { getMongoStringId } from "./util";

/**
 * Get threshold and total weight of multisig
 * @param multiSig - multisig object
 * @returns string
 */
export function getThresholdAndWeight(multiSig: IMultisig) {
    const threshold = multiSig.threshold;
    const totalWeight = getTotalWeight(multiSig);
    return `${threshold}/${totalWeight}`;
}

/**
 * Get total weight of all members in a multisig
 * @param multiSig - multisig object
 * @returns number - total weight of all members
 */
export function getTotalWeight(multiSig: IMultisig): number {
    let total = 0;
    for (const member of multiSig.members) {
        total += member.weight;
    }
    return total;
}

export function checkIsMultisigPendingUser(
    multisig: IMultisig,
    userAddress?: string,
): boolean {
    if (!userAddress) return false;
    return multisig.members.some(
        (member) => member.address === userAddress && !member.publicKeyB64,
    );
}

export function getWeightForAddressFromMSig(
    multiSig: IMultisig,
    address: string,
): number {
    const member = multiSig.members.find((m) => m.address === address);
    return member?.weight || 0;
}

/**
 * Update selected MSig state var and url params with new msig selected
 * @param multisig - new msig to change to
 */
export const handleMSigChange = (multisig: IMultisig, router: NextRouter) => {
    router.replace(
        {
            pathname: router.pathname,
            query: {
                ...router.query,
                msig: multisig.address || getMongoStringId(multisig),
            },
        },
        undefined,
        { shallow: true },
    );
};

export const isAddressInMultisig = (
    address: string,
    multiSig: IMultisig,
): boolean => {
    return multiSig.members.some((member) => member.address === address);
};
