import connectToDb from "@src/db/connectToDb";
import { createTransaction, findOneMultiSigByQuery } from "@src/db/mongo";
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
import {
    getWeightForAddressFromMSig,
    isAddressInMultisig,
} from "@src/util/multisigUtil";
import Cors from "cors";
import { BASE_URL } from "@src/constants/constants";
import { TXN_ROUTE } from "@src/util/routerUtil";
import { getMongoStringId } from "@src/util/util";

/**
 * Run a middleware function with the given request, response,
 * and callback. Any errors will be rejected, and any results
 * will be resolved.
 *
 * @param req - The incoming request
 * @param res - The outgoing response
 * @param fn - The middleware function to run
 * @returns A promise that will resolve with the result of the
 * middleware, or reject with any errors
 */
function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function,
) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// Initialize the cors middleware
const cors = Cors({
    methods: ["POST", "GET", "HEAD"],
    origin:
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "http://localhost:3000", // TODO - implement way to get allowed origins
    credentials: true,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // run middleware to verify handle cors
    await runMiddleware(req, res, cors);
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const {
        bytesB64,
        address,
        signature,
        multisigAddress,
    }: {
        bytesB64: string;
        address: string;
        signature: string;
        multisigAddress: string;
    } = req.body;

    if (!bytesB64 || !address || !signature || !multisigAddress) {
        sendApiResponse(res, {
            success: false,
            err: "Missing parameters",
        });
        return;
    }

    try {
        await connectToDb();
        const multisig = await findOneMultiSigByQuery({
            address: multisigAddress,
        });
        if (!multisig) {
            sendApiResponse(res, {
                success: false,
                err: "Multisig not found",
            });
            return;
        }

        if (!isAddressInMultisig(address, multisig)) {
            sendApiResponse(res, {
                success: false,
                err: "Address not in multisig",
            });
            return;
        }

        const txn: ITransaction = {
            multisigAddress,
            bytesB64,
            signatures: [
                {
                    signature,
                    weight: getWeightForAddressFromMSig(multisig, address),
                    address: address,
                    timestamp: Date.now(),
                },
            ],
        };

        // Create the multisig account
        const newTxn = await createTransaction(txn);

        const redirectUrl = `${BASE_URL}${
            TXN_ROUTE.path
        }?msig=${multisigAddress}&txnId=${getMongoStringId(newTxn)}`;

        sendApiResponse(res, {
            success: true,
            data: redirectUrl,
        });
    } catch (e: any) {
        console.error(
            `Error creating transaction. req.body:`,
            req.body,
            "e:",
            e,
        );
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
