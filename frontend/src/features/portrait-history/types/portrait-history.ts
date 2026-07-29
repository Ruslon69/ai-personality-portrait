export type PortraitHistoryAccess = 'free' | 'full';

export type PortraitHistoryItem = {
  access: PortraitHistoryAccess;
  createdAt: string;
  id: string;
  keyPhrase: string;
  modules: readonly string[];
  title: string;
};
