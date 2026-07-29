export type StorageAdapter = {
  get: (key: string) => string | null;
  remove: (key: string) => void;
  set: (key: string, value: string) => boolean;
};
