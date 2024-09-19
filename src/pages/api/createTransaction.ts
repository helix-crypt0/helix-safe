import connectToDb from "@src/db/connectToDb";
import {
    createMultiSig,
    createTransaction,
    findOneMultiSigByQuery,
} from "@src/db/mongo";
import { IMultisig } from "@src/db/schema/multisig";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import {
    verifyPersonalMessageSignature,
    verifyTransactionSignature,
} from "@mysten/sui/verify";
import { fromB64 } from "@mysten/sui/utils";
import { PublicKey } from "@mysten/sui/cryptography";
import { ITransaction } from "@src/db/schema/transaction";
import { isAddressInMultisig } from "@src/util/multisigUtil";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const { txn }: { txn: ITransaction } = req.body;

    try {
        await connectToDb();

        const signature = txn.signatures[0]?.signature;
        if (!signature) {
            const errMsg = "Missing signature";
            console.log(errMsg);
            sendApiResponse(res, {
                success: false,
                err: errMsg,
            });
            return;
        }

        // Verify the signature  and make sure it's part of the multisig account
        const txnBytes: Uint8Array = fromB64(txn.bytesB64);
        const publicKey: PublicKey = await verifyTransactionSignature(
            txnBytes,
            signature,
        );
        const sigAddress = publicKey.toSuiAddress();

        const multisig = await findOneMultiSigByQuery({
            address: txn.multisigAddress,
        });

        if (!multisig) {
            sendApiResponse(res, {
                success: false,
                err: "Multisig not found",
            });
            return;
        }

        if (!isAddressInMultisig(sigAddress, multisig)) {
            sendApiResponse(res, {
                success: false,
                err: "Address not in multisig",
            });
            return;
        }

        // Create the transaction
        const newTxn = await createTransaction(txn);

        sendApiResponse(res, {
            success: true,
            data: newTxn,
        });
    } catch (e: any) {
        console.error(`Error logging user in. req.body = ${req.body}`, e);
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
