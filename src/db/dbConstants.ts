export enum DATABASE_COLLECTION {
    MULTISIG = "multisig",
    TRANSACTION = "transaction",
    ADDRESS_PUBLIC_KEY = "addressPublicKey",
}
export const TIMESTAMPS = "timestamps";
export const MONGO_REQUIRED_STRING = {
    type: String,
    required: true,
};
export const MONGO_REQUIRED_NUMBER = {
    type: Number,
    required: true,
};
export const MONGO_REQUIRED_BOOLEAN = {
    type: Boolean,
    required: true,
};
export const MONGO_REQUIRED_DATE = {
    type: Date,
    required: true,
};
