import mongoose, { Schema, model, Document, Types } from "mongoose";
import {
    DATABASE_COLLECTION,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "../dbConstants";

export interface IAddressPublicKey {
    address: string;
    publicKeyB64?: string;

    // mongo fields
    createdAt?: Date;
    updatedAt?: Date;
    _id?: Types.ObjectId;
    __v?: number;
}

const addressPublicKeySchema = new Schema<IAddressPublicKey>({
    address: MONGO_REQUIRED_STRING,
    publicKeyB64: MONGO_REQUIRED_STRING,
});

addressPublicKeySchema.set(TIMESTAMPS, true);

addressPublicKeySchema.index({ address: 1 });

// Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
// see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
export const addressPublicKeyModel =
    (mongoose.models[DATABASE_COLLECTION.ADDRESS_PUBLIC_KEY] as mongoose.Model<
        IAddressPublicKey,
        {},
        {},
        {},
        any
    >) ||
    model<IAddressPublicKey>(
        DATABASE_COLLECTION.ADDRESS_PUBLIC_KEY,
        addressPublicKeySchema,
    );

export type AddressPublicKeyDoc = Document<unknown, any, IAddressPublicKey> &
    IAddressPublicKey &
    Required<{
        _id: Types.ObjectId;
    }>;
