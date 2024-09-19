import connectToDb from "@src/db/connectToDb";
import { findTxnsByQuery } from "@src/db/mongo";
import { ITransaction } from "@src/db/schema/transaction";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const { multisigAddresses }: { multisigAddresses: string[] } = req.body;
    const filteredAddresses = multisigAddresses.filter((addr) => addr != "");

    try {
        await connectToDb();

        // Fetch the txns for each msig address
        const promises = filteredAddresses.map((multisigAddress) => {
            return findTxnsByQuery({ multisigAddress });
        });
        const txnsPerAddressArr: ITransaction[][] = await Promise.all(promises);

        // create a map of msig address to transactions
        const addressToTxnsMap: { [address: string]: ITransaction[] } = {};
        for (const [idx, address] of filteredAddresses.entries()) {
            const txns: ITransaction[] = txnsPerAddressArr[idx];
            // addressToTxnsMap.set(address, txns);
            addressToTxnsMap[address] = txns;
        }

        sendApiResponse(res, {
            success: true,
            data: addressToTxnsMap,
        });
    } catch (e: any) {
        console.error(`Error fetching txns. req.body = ${req.body}`, e);
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
