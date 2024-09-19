import connectToDb from "@src/db/connectToDb";
import { findOneMultiSigByQuery, updateOneMultiSig } from "@src/db/mongo";
import { IMultisig } from "@src/db/schema/multisig";
import { sendApiResponse } from "@src/util/backend/apiUtil";
import { NextApiRequest, NextApiResponse } from "next";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { fromB64 } from "@mysten/sui/utils";
import { PublicKey } from "@mysten/sui/cryptography";
import { convertB64ToPublicKey } from "@src/util/suiUtil";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST")
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    const {
        msigId,
        signature,
        bytes,
    }: { msigId: string; signature: string; bytes: string } = req.body;

    try {
        await connectToDb();

        // Verify the requesters signature and ensure it matches an address in the multisig account
        const publicKey: PublicKey = await verifyPersonalMessageSignature(
            fromB64(bytes),
            signature
        );
        const newPublicKeyB64 = publicKey.toBase64();
        const flag = publicKey.flag();
        const sigAddress = publicKey.toSuiAddress();

        // fetch the multisig account
        const mSig = await findOneMultiSigByQuery({
            _id: msigId,
            "members.address": sigAddress,
        });
        if (!mSig) {
            const errMsg = `Unable to find multisig account with id ${msigId} containing member with address ${sigAddress}`;
            console.log(errMsg);
            sendApiResponse(res, {
                success: false,
                err: errMsg,
            });
            return;
        }

        // if all members now have a public key, create the multisig account using the sui-sdk
        let mSigAddress = mSig.address;
        const allMembersHavePublicKey = mSig.members
            .filter((m) => m.address !== sigAddress) // exclude the member that just signed since we're about to add their public key
            .every(
                (member) => member.publicKeyB64 && member.flag !== undefined
            );

        if (allMembersHavePublicKey) {
            const pubKeys: {
                weight: number;
                publicKey: PublicKey;
            }[] = mSig.members.map((m) => {
                if (m.address === sigAddress) {
                    return {
                        weight: m.weight,
                        publicKey: publicKey,
                    };
                }
                return {
                    weight: m.weight,
                    publicKey: convertB64ToPublicKey(m.publicKeyB64!, m.flag!),
                };
            });

            const multiSigPublicKey: MultiSigPublicKey =
                MultiSigPublicKey.fromPublicKeys({
                    threshold: mSig.threshold,
                    publicKeys: pubKeys,
                });

            mSigAddress = multiSigPublicKey.toSuiAddress();
        }

        // Update the multisig account
        const newMSig = await updateOneMultiSig(
            { _id: msigId, "members.address": sigAddress },
            {
                $set: {
                    "members.$.publicKeyB64": newPublicKeyB64,
                    "members.$.flag": flag,
                    address: mSigAddress,
                },
            }
        );

        sendApiResponse(res, {
            success: true,
            data: newMSig,
        });
    } catch (e: any) {
        console.error(`Error logging user in. req.body = ${req.body}`, e);
        sendApiResponse(res, {
            success: false,
            err: e.message,
        });
    }
}
