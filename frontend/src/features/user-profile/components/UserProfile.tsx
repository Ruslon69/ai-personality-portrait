import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { PersonalityProfile } from '@entities/personality-profile';

import {
  LatestPortraitSection,
  ProfileCompletionSection,
  ProfileHero,
  ProfilePrivacySection,
  QuickActionsSection,
} from '../sections';
import styles from './UserProfile.module.css';

type UserProfileProps = {
  onCreatePortrait: () => void;
  onOpenCompatibility: () => void;
  onOpenHistory: () => void;
  onOpenPortrait: () => void;
  onOpenSettings: () => void;
  profile: PersonalityProfile;
};

export function UserProfile({
  onCreatePortrait,
  onOpenCompatibility,
  onOpenHistory,
  onOpenPortrait,
  onOpenSettings,
  profile,
}: UserProfileProps) {
  useEffect(() => focusElementByIdOnNextFrame('profile-title'), []);

  return (
    <div className={styles.root}>
      <ProfileHero
        greeting="Ваше пространство"
        introduction="Здесь собраны последний портрет, использованные источники и короткие пути к основным действиям."
      />
      <LatestPortraitSection onOpenPortrait={onOpenPortrait} profile={profile} />
      <ProfileCompletionSection items={profile.completion} />
      <QuickActionsSection
        onCreatePortrait={onCreatePortrait}
        onOpenCompatibility={onOpenCompatibility}
        onOpenHistory={onOpenHistory}
        onOpenPortrait={onOpenPortrait}
        onOpenSettings={onOpenSettings}
      />
      <ProfilePrivacySection
        onOpenSettings={onOpenSettings}
        reminder="Вы управляете сохранёнными портретами и данными. Настройки удаления и приватности всегда доступны отдельно."
      />
    </div>
  );
}
