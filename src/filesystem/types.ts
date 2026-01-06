export type EntryIndex = {
  id?: string;
  hash: string;
  path: string;
  status?: 'ORIGINAL' | 'CREATED' | 'UPDATED' | 'DELETED';
};
