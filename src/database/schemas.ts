import { model, Schema, type SchemaOptions } from 'mongoose';
import type { FileEntry, HashedEntry, MongoEntry } from './types';

const required = true,
  trim = true;

const GroupSchema = new Schema<HashedEntry>(
  {
    entries: [{ refPath: 'groups', type: Schema.Types.ObjectId }],
    files: [{ refPath: 'files', type: Schema.Types.ObjectId }],
    hash: { required, type: String },
    name: { required, trim, type: String },
    path: { required, type: String },
  },
  hideOptions(),
);

const FileSchema = new Schema<FileEntry>(
  {
    name: { required, trim, type: String },
    path: { required, type: String },
    type: { required, type: String },
  },
  hideOptions(),
);

export const GroupModel = model<HashedEntry>('groups', GroupSchema);
export const FileModel = model<FileEntry>('files', FileSchema);

function hideOptions<T>(): SchemaOptions<T & MongoEntry> {
  return {
    strict: true,
    toJSON: {
      transform(_, ret) {
        delete ret.__v;
      },
    },
    toObject: {
      transform(_, ret) {
        delete ret.__v;
      },
    },
  };
}
