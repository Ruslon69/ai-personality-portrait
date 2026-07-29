export type ProfileSource = {
  id: string;
  label: string;
};

export type ProfileCompletionStatus = 'complete' | 'skipped' | 'missing';

export type ProfileCompletionItem = {
  description: string;
  id: string;
  label: string;
  status: ProfileCompletionStatus;
};

export type ProfileLatestPortrait = {
  createdAt: string;
  id: string;
  keyPhrase: string;
  sources: readonly ProfileSource[];
};

export type UserProfileData = {
  completion: readonly ProfileCompletionItem[];
  greeting: string;
  introduction: string;
  latestPortrait: ProfileLatestPortrait;
  privacyReminder: string;
};
