import { useEffect } from 'react';

import {
  LatestPortraitSection,
  ProfileCompletionSection,
  ProfileHero,
  ProfilePrivacySection,
  QuickActionsSection,
} from '../sections';
import type { UserProfileData } from '../types';
import styles from './UserProfile.module.css';

type UserProfileProps = {
  data: UserProfileData;
  onCreatePortrait: () => void;
  onOpenCompatibility: () => void;
  onOpenHistory: () => void;
  onOpenPortrait: () => void;
  onOpenSettings: () => void;
};

export function UserProfile({
  data,
  onCreatePortrait,
  onOpenCompatibility,
  onOpenHistory,
  onOpenPortrait,
  onOpenSettings,
}: UserProfileProps) {
  useEffect(() => {
    window.requestAnimationFrame(() => document.getElementById('profile-title')?.focus());
  }, []);

  return (
    <div className={styles.root}>
      <ProfileHero greeting={data.greeting} introduction={data.introduction} />
      <LatestPortraitSection onOpenPortrait={onOpenPortrait} portrait={data.latestPortrait} />
      <ProfileCompletionSection items={data.completion} />
      <QuickActionsSection
        onCreatePortrait={onCreatePortrait}
        onOpenCompatibility={onOpenCompatibility}
        onOpenHistory={onOpenHistory}
        onOpenPortrait={onOpenPortrait}
        onOpenSettings={onOpenSettings}
      />
      <ProfilePrivacySection onOpenSettings={onOpenSettings} reminder={data.privacyReminder} />
    </div>
  );
}
