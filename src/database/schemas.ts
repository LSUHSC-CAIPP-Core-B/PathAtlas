import { model, Schema, type SchemaOptions } from 'mongoose';
import type { FileEntry, HashedEntry, MongoEntry } from './types';

const required = true,
  unique = true;

const ProjectSchema = new Schema<HashedEntry>(
  {
    absolutePath: { required, type: String, unique },
    files: [{ refPath: 'files', type: Schema.Types.ObjectId }],
    hash: { required, type: String },
    path: { required, type: String, unique },
  },
  hideOptions(),
);

ProjectSchema.pre('validate', async function () {
  const absolute = this.get('absolutePath');
  const relative = this.get('path')
    .replace(/\/?$/gi, '')
    .replace(/^(?!\/)\//gi, '/');

  if (absolute.endsWith(relative)) return;

  throw new Error('Relative Path must resolve to the Absolute Path');
});

const FileSchema = new Schema<FileEntry>(
  {
    changedOn: [{ required, type: Date }],
    createdOn: { required, type: Date },
    hash: { required, type: String },
    path: { required, type: String },
    type: { required, type: String },
  },
  hideOptions(),
);

FileSchema.pre('save', function () {
  this.changedOn.push(new Date());
});

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
