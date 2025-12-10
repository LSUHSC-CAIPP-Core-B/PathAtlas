import { model, Schema, SchemaOptions } from "mongoose";
import { FileEntry, HashedEntry, MongoEntry } from "./types";

const required = true,
    trim = true;


const GroupSchema = new Schema<HashedEntry>({
    name: { type: String, required, trim },
    hash: { type: String, required },
    path: { type: String, required },
    entries: [{ type: Schema.Types.ObjectId, refPath: 'groups' }],
    files: [{ type: Schema.Types.ObjectId, refPath: 'files' }],
}, hideOptions());

const FileSchema = new Schema<FileEntry>({
    name: { type: String, required, trim },
    type: { type: String, required },
    path: { type: String, required },
}, hideOptions());


export const GroupModel = model<HashedEntry>('groups', GroupSchema);
export const FileModel = model<FileEntry>('files', FileSchema);



function hideOptions<T>(): SchemaOptions<T & MongoEntry> {
    return {
        toJSON: {
            transform(_, ret) {
                delete ret.__v;
            }
        },
        toObject: {
            transform(_, ret) {
                delete ret.__v;
            }
        },
        strict: true
    };
};
