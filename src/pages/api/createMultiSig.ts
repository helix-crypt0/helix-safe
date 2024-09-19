import connectToDb from "@src/db/connectToDb";
import { createMultiSig, findAddressPKeysByQuery } from "@src/db/mongo";
import { IMultisig } from "@src/db/schema/multisig";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { fromB64 } from "@mysten/sui/utils";
import { PublicKey } from "@mysten/sui/cryptography";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { convertB64ToPublicKey } from "@src/util/suiUtil";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const {
        msig,
        signature,
        bytes,
    }: { msig: IMultisig; signature: string; bytes: string } = req.body;

    // Validate the multisig account size
    if (msig.members.length < 2) {
        const errMsg = "Multisig accounts must have at least 2 members";
        console.log(errMsg);
        sendApiResponse(res, {
            success: false,
            err: errMsg,
        });
        return;
    }

    try {
        await connectToDb();

        // Verify the creators signature matches the first address in the multisig account
        const publicKey: PublicKey = await verifyPersonalMessageSignature(
            fromB64(bytes),
            signature,
        );
        const flag: number = publicKey.flag();
        msig.members[0].flag = flag;
        const sigAddress = publicKey.toSuiAddress();
        if (sigAddress !== msig.members[0].address) {
            const errMsg = "Signature does not match multisig member address";
            console.log(errMsg);
            sendApiResponse(res, {
                success: false,
                err: errMsg,
            });
            return;
        }

        // check if we have any of the members public keys stored in the db
        const allAddresses = msig.members.map((m) => m.address);
        const existingAddresses = await findAddressPKeysByQuery(
            {
                address: { $in: allAddresses },
            },
            { address: 1, publicKeyB64: 1 },
        );

        // update the multisig members with the public keys from the db
        for (const member of msig.members) {
            const existingMember = existingAddresses.find(
                (a) => a.address === member.address,
            );
            if (existingMember) {
                member.publicKeyB64 = existingMember.publicKeyB64;
            }
        }

        // check if all members have a public key
        const pubKeys: { weight: number; publicKey: PublicKey }[] = [];
        for (const m of msig.members) {
            if (m.publicKeyB64 !== undefined) {
                try {
                    const pubKey = {
                        weight: m.weight,
                        publicKey: convertB64ToPublicKey(m.publicKeyB64!, 0), // assume flag is 0 (i.e. ED25519)
                    };
                    pubKeys.push(pubKey);
                } catch (e) {
                    console.log("unable to convert public key", e);
                    continue;
                }
            }
        }

        const allMembersHavePublicKey = pubKeys.length === msig.members.length;
        if (allMembersHavePublicKey) {
            console.log("All members have a public key, generating address");
            // create the multisig account
            const multiSigPublicKey: MultiSigPublicKey =
                MultiSigPublicKey.fromPublicKeys({
                    threshold: msig.threshold,
                    publicKeys: pubKeys,
                });

            msig.address = multiSigPublicKey.toSuiAddress();

            // make sure the multisig account doesn't already exist
            const existingMSig = await findAddressPKeysByQuery(
                {
                    address: msig.address,
                },
                { address: 1 },
            );
            if (existingMSig.length > 0) {
                const errMsg = `Multisig account already exists with address ${msig.address}`;
                console.log(errMsg);
                sendApiResponse(res, {
                    success: false,
                    err: errMsg,
                });
                return;
            }
        }

        // Create the multisig account
        const newMSig = await createMultiSig(msig);

        sendApiResponse(res, {
            success: true,
            data: newMSig,
        });
    } catch (e: any) {
        console.error(
            `Error creating multisig account. req.body = ${req.body}`,
            e,
        );
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
