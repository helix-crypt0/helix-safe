import connectToDb from "@src/db/connectToDb";
import {
    findOneMultiSigByQuery,
    findOneTxnByQuery,
    updateOneTxn,
} from "@src/db/mongo";
import { IMultisig } from "@src/db/schema/multisig";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyTransactionSignature } from "@mysten/sui/verify";
import { fromB64 } from "@mysten/sui/utils";
import { PublicKey } from "@mysten/sui/cryptography";
import { ITransaction } from "@src/db/schema/transaction";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const {
        txnId,
        signature,
    }: { txnId: string; signature: string; bytes: string } = req.body;

    try {
        await connectToDb();

        // get txn from mongo
        const txn: ITransaction = await findOneTxnByQuery({ _id: txnId });
        if (!txn) {
            const errMsg = `Unable to find txn with id ${txnId} `;
            console.log(errMsg);
            sendApiResponse(res, {
                success: false,
                err: errMsg,
            });
            return;
        }

        // get users public key
        const publicKey: PublicKey = await verifyTransactionSignature(
            fromB64(txn.bytesB64),
            signature
        );
        const sigAddress = publicKey.toSuiAddress();

        // get MSig from mongo using msig address and signature address
        const multisigAddress = txn.multisigAddress;
        const mSig = await findOneMultiSigByQuery({
            address: multisigAddress,
            "members.address": sigAddress,
        });
        if (!mSig) {
            const errMsg = `Unable to find multisig account with id ${multisigAddress} contianing member with address ${sigAddress}`;
            console.log(errMsg);
            sendApiResponse(res, {
                success: false,
                err: errMsg,
            });
            return;
        }
        const weight =
            mSig.members.find((m) => m.address === sigAddress)?.weight || 1;

        // update the transaction with the new signature
        const newTxn = await updateOneTxn(
            { _id: txnId },
            {
                $push: {
                    signatures: {
                        signature,
                        weight,
                        address: sigAddress,
                        timestamp: Date.now(),
                    },
                },
            }
        );

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
