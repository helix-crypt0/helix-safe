import connectToDb from "@src/db/connectToDb";
import { findMultiSigsByQuery } from "@src/db/mongo";
import { IMultisig } from "@src/db/schema/multisig";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const { address }: { address: string } = req.body;

    try {
        await connectToDb();

        // Fetch the multisig account
        const mSigs: IMultisig[] = await findMultiSigsByQuery({
            "members.address": address,
        });
        sendApiResponse(res, {
            success: true,
            data: mSigs,
        });
    } catch (e: any) {
        console.error(`Error fetching multisigs. req.body = ${req.body}`, e);
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
