import { Types } from "mongoose"
import { RequireOne } from "../types"

export type MongoEntry = {
    _id: Types.ObjectId
};

type EntryRequirements = RequireOne<{
    entries: Types.ObjectId[],
    files: Types.ObjectId[],
}>;

export type HashedEntry = {
    name: string,
    hash: string,
    path: string,
} & MongoEntry & EntryRequirements;

export type FileEntry = {
    name: string,
    type: string,
    path: string,
    absolutePath?: string,
} & MongoEntry;
