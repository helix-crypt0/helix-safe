import {
    FilterQuery,
    ProjectionType,
    UpdateQuery,
    UpdateWithAggregationPipeline,
} from "mongoose";
import { IMultisig, multisigModel } from "./schema/multisig";
import { ITransaction, transactionModel } from "./schema/transaction";
import { addressPublicKeyModel, IAddressPublicKey } from "./schema/publicKey";

////// MULTISIGS //////
/**
 *  Create a multisig Account
 * @param mSig - multiSig to create
 */
export async function createMultiSig(mSig: IMultisig) {
    return await multisigModel.create(mSig);
}

/**
 * Find multisigs by query
 * @param query - query to find multisigs by
 * @returns array of found multisigs
 */
export async function findMultiSigsByQuery(query: FilterQuery<IMultisig>) {
    return await multisigModel.find(query);
}

/**
 * Find multisig by query
 * @param query - query to find multisig by
 * @returns multisig doc or null if not found
 */
export async function findOneMultiSigByQuery(
    query: FilterQuery<IMultisig>,
): Promise<IMultisig | null> {
    return await multisigModel.findOne(query);
}

/**
 * Update msig in DB
 * @param query - mongo query to find msig to update
 * @param update - object defining the update to make
 * @param arrayFilters - optional argument to specify which array item to update in a team doc
 * @returns update result
 */
export async function updateOneMultiSig(
    query: FilterQuery<IMultisig>,
    update: UpdateWithAggregationPipeline | UpdateQuery<IMultisig>,
    arrayFilters?: { [key: string]: any }[], //  determine which array elements to modify for an update operation on an array field.  see https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
) {
    return await multisigModel.findOneAndUpdate(query, update, {
        returnDocument: "after",
    });
}

////// TRANSACTIONS //////
/**
 *  Create a txn
 * @param txn - txn to create
 */
export async function createTransaction(
    txn: ITransaction,
): Promise<ITransaction> {
    return await transactionModel.create(txn);
}

/**
 * Find txns by query
 * @param query - query to find txns by
 * @returns array of found txns
 */
export async function findTxnsByQuery(query: FilterQuery<ITransaction>) {
    return await transactionModel.find(query).sort({ _id: -1 });
}

/**
 * Update txn in DB
 * @param query - mongo query to find txn to update
 * @param update - object defining the update to make
 * @param arrayFilters - optional argument to specify which array item to update in a txn doc
 * @returns update result
 */
export async function updateOneTxn(
    query: FilterQuery<ITransaction>,
    update: UpdateWithAggregationPipeline | UpdateQuery<ITransaction>,
    arrayFilters?: { [key: string]: any }[], //  determine which array elements to modify for an update operation on an array field.  see https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
) {
    return await transactionModel.findOneAndUpdate(query, update, {
        returnDocument: "after",
    });
}

/**
 * Find txn by query
 * @param query - query to find txn by
 * @returns txn doc or null if not found
 */
export async function findOneTxnByQuery(query: FilterQuery<ITransaction>) {
    return await transactionModel.findOne(query);
}

////// ADDRESS PUBLIC KEYS //////
/**
 * Find adddress pkeys  by query
 * @param query - query to find address pkey  by
 * @returns array of found address pkeys
 */
export async function findAddressPKeysByQuery(
    query: FilterQuery<IAddressPublicKey>,
    projection?: ProjectionType<IAddressPublicKey> | null | undefined,
) {
    return await addressPublicKeyModel.find(query, projection).lean();
}

/**
 * Insert many address pkeys
 * @param addressPKeys - new address pkeys to insert
 * @returns insertion result
 */
export async function insertManyAddressPKeys(
    addressPKeys: IAddressPublicKey[],
) {
    return await addressPublicKeyModel.insertMany(addressPKeys);
}
