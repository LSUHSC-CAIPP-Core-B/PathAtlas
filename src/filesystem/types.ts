export type EntryIndex = {
  hash: string;
  path: string;
  status?: 'ORIGINAL' | 'CREATED' | 'UPDATED' | 'DELETED';
};
