import connectToDb from "@src/db/connectToDb";
import { findOneTxnByQuery, updateOneTxn } from "@src/db/mongo";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import { ITransaction } from "@src/db/schema/transaction";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const { txnId, digest }: { txnId: string; digest: string } = req.body;

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

        // update the transaction with the new signature
        const newTxn = await updateOneTxn(
            { _id: txnId },
            {
                $set: {
                    digest,
                    executedTimestamp: Date.now(),
                },
            },
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
