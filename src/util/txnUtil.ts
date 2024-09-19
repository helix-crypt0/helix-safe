import { IMultisig, MultiSigMember } from "@src/db/schema/multisig";
import { ITransaction, TransactionSignature } from "@src/db/schema/transaction";

/**
 * Get total weight of a transaction's signatures
 * @param txn - transaction to get total weight for
 * @returns number
 */
export const getTotalSignatureWeight = (txn: ITransaction): number => {
    return txn.signatures.reduce((acc, curr) => acc + curr.weight, 0);
};

/**
 * Checks if member signature is present in a transaction
 * @param txn - txn to check
 * @param member - member to check
 * @returns boolean
 */
export const hasMemberSignedTxn = (
    txn: ITransaction,
    member: MultiSigMember,
): boolean => {
    const sigs = txn.signatures;
    const matchingSig = sigs.find((sig) => sig.address === member.address);
    return Boolean(matchingSig);
};

/**
 * Gets the timestamp of a member's signature in a transaction.
 * If the member has not signed the transaction, returns 0.
 * @param txn - transaction to check
 * @param member - member to check
 * @returns timestamp of the matching signature, or 0 if not found
 */
export const getSignatureTime = (
    txn: ITransaction,
    member: MultiSigMember,
): number => {
    const sigs = txn.signatures;
    const matchingSig = sigs.find((sig) => sig.address === member.address);
    return matchingSig?.timestamp || 0;
};

/**
 * check if the member signature will exceed the threshold
 * @param txn - txn to check signatures for
 * @param member - member to check signature weight for
 * @param multiSig - multisig object containing threshold
 * @returns boolean
 */
export const willMemberSignatureExceedThreshold = (
    txn: ITransaction,
    member: MultiSigMember,
    multiSig: IMultisig,
): boolean => {
    const totalWeight = getTotalSignatureWeight(txn);
    const memberWeight = member.weight;
    const threshold = multiSig.threshold;
    return totalWeight + memberWeight >= threshold;
};

/**
 * Get ordered signatures based on the order of the multisig members
 * @param multisig - multisig object
 * @param transaction - transaction object
 * @returns TransactionSignature[]
 */
export function getOrderedSignatures(
    multisig: IMultisig,
    transaction: ITransaction,
): TransactionSignature[] {
    // Create a map of address to their order in the members array
    const addressOrderMap = new Map<string, number>();
    multisig.members.forEach((member, index) => {
        addressOrderMap.set(member.address, index);
    });

    // Sort the transaction signatures based on the order of their respective addresses in the multisig members array
    const orderedSignatures = transaction.signatures.slice().sort((a, b) => {
        const orderA =
            addressOrderMap.get(a.address) ?? Number.MAX_SAFE_INTEGER;
        const orderB =
            addressOrderMap.get(b.address) ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });

    return orderedSignatures;
}
