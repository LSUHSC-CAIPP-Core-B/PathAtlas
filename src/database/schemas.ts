import { model, Schema, type SchemaOptions } from 'mongoose';
import type { FileEntry, HashedEntry, MongoEntry } from './types';

const required = true,
  trim = true;

const ProjectSchema = new Schema<HashedEntry>(
  {
    absolutePath: { required, type: String },
    files: [{ refPath: 'files', type: Schema.Types.ObjectId }],
    hash: { required, type: String },
    name: { required, trim, type: String },
    path: { required, type: String },
  },
  hideOptions(),
);

ProjectSchema.pre('save', function (next: Function) {
  const absolute = this.get('absolutePath');
  const relative = this.get('path')
    .replace(/\/?$/gi, '')
    .replace(/^(?!\/)\//gi, '/');

  if (absolute.endsWith(relative)) return next();

  next(new Error('Relative Path must resolve to the Absolute Path'));
});

const FileSchema = new Schema<FileEntry>(
  {
    name: { required, trim, type: String },
    path: { required, type: String },
    type: { required, type: String },
  },
  hideOptions(),
);

export const ProjectModel = model<HashedEntry>('projects', ProjectSchema);
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
