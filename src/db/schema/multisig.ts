import {
    TIMESTAMPS,
    DATABASE_COLLECTION,
    MONGO_REQUIRED_STRING,
    MONGO_REQUIRED_NUMBER,
} from "../dbConstants";
import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface MultiSigMember {
    address: string;
    weight: number;
    publicKeyB64?: string;
    flag?: number; // used to determine what kind of signature scheme is used: https://docs.sui.io/concepts/cryptography/transaction-auth/signatures
}

export interface IMultisig {
    address: string;
    members: MultiSigMember[];
    threshold: number;
    name?: string;
    description?: string;

    // mongo fields
    createdAt?: Date;
    updatedAt?: Date;
    _id?: Types.ObjectId;
    __v?: number;
}

// mongo schema
const multisigSchema = new Schema<IMultisig>({
    address: String,
    threshold: MONGO_REQUIRED_NUMBER,
    members: [
        {
            address: MONGO_REQUIRED_STRING,
            weight: MONGO_REQUIRED_NUMBER,
            publicKeyB64: String,
            flag: Number,
        },
    ],
    name: String,
    description: String,
});

multisigSchema.set(TIMESTAMPS, true);

// add indexes
multisigSchema.index({ address: 1 });
multisigSchema.index({ "members.address": 1 });
multisigSchema.index({ address: 1, "members.address": 1 });
multisigSchema.index({ "members.publicKeyB64": 1 });

// Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
// see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
export const multisigModel =
    (mongoose.models[DATABASE_COLLECTION.MULTISIG] as mongoose.Model<
        IMultisig,
        {},
        {},
        {},
        any
    >) || model<IMultisig>(DATABASE_COLLECTION.MULTISIG, multisigSchema);

export type MultisigDoc = Document<unknown, any, IMultisig> &
    IMultisig &
    Required<{
        _id: Types.ObjectId;
    }>;
