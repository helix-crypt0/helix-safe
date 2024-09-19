import connectToDb from "@src/db/connectToDb";
import { findAddressPKeysByQuery, insertManyAddressPKeys } from "@src/db/mongo";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import { IAddressPublicKey } from "@src/db/schema/publicKey";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const {
        accountsData,
    }: {
        accountsData: IAddressPublicKey[];
    } = req.body;

    try {
        await connectToDb();
        // Step 1: Get a list of addresses that already exist in the database
        const existingAddresses = await findAddressPKeysByQuery(
            {
                address: { $in: accountsData.map((a) => a.address) },
            },
            { address: 1 },
        );

        // Step 2: Filter out addresses that are already in the database
        const existingAddressSet = new Set(
            existingAddresses.map((item) => item.address),
        );
        const newAddressPublicKeys = accountsData.filter(
            (item) => !existingAddressSet.has(item.address),
        );

        // Step 3: Insert only the non-duplicate records
        if (newAddressPublicKeys.length > 0) {
            const result = await insertManyAddressPKeys(newAddressPublicKeys);
            console.log("New documents inserted:", result);
        } else {
            console.log("No new documents to insert.");
        }
        sendApiResponse(res, {
            success: true,
        });
    } catch (e: any) {
        console.error(
            `Error registering public keys. req.body = ${req.body}`,
            e,
        );
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
