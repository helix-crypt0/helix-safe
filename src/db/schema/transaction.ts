import {
    TIMESTAMPS,
    DATABASE_COLLECTION,
    MONGO_REQUIRED_STRING,
    MONGO_REQUIRED_NUMBER,
} from "../dbConstants";
import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface TransactionSignature {
    signature: string;
    weight: number;
    address: string;
    timestamp: number; // unix timestamp in ms
}

export interface ITransaction {
    multisigAddress: string;
    bytesB64: string;
    signatures: TransactionSignature[];
    name?: string;
    description?: string;
    digest?: string;
    executedTimestamp?: number;

    // mongo fields
    createdAt?: Date;
    updatedAt?: Date;
    _id?: Types.ObjectId;
    __v?: number;
}

// mongo schema
const transactionSchema = new Schema<ITransaction>({
    multisigAddress: MONGO_REQUIRED_STRING,
    bytesB64: MONGO_REQUIRED_STRING,
    signatures: [
        {
            signature: MONGO_REQUIRED_STRING,
            weight: MONGO_REQUIRED_NUMBER,
            address: MONGO_REQUIRED_STRING,
            timestamp: MONGO_REQUIRED_NUMBER,
        },
    ],
    digest: String,
    name: String,
    description: String,
    executedTimestamp: Number,
});

transactionSchema.set(TIMESTAMPS, true);

// add indexes
transactionSchema.index({ multisigAddress: 1 });

// Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
// see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
export const transactionModel =
    (mongoose.models[DATABASE_COLLECTION.TRANSACTION] as mongoose.Model<
        ITransaction,
        {},
        {},
        {},
        any
    >) ||
    model<ITransaction>(DATABASE_COLLECTION.TRANSACTION, transactionSchema);

export type TransactionDoc = Document<unknown, any, ITransaction> &
    ITransaction &
    Required<{
        _id: Types.ObjectId;
    }>;
