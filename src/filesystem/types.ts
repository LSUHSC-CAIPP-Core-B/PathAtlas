export type Reference = {
  ignored: string[];
  packed: PackedFolders;
} & Record<string, any>;

type PackedFolders = {
  [folder: string]: string;
};
