import { useEffect, type ReactNode } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { Locale } from '@shared/i18n';

import { AppearanceSettingsSection, LocalDataSection, SettingsHero } from '../sections';
import { useUserSettings } from '../hooks';
import { userSettingsCopy } from '../data';
import type { AppearanceOption } from '../types';
import styles from './UserSettings.module.css';

type UserSettingsProps = {
  appearanceOptions: readonly AppearanceOption[];
  locale: Locale;
  onOpenHistory: () => void;
  onOpenPrivacy: () => void;
  onOpenProfile?: () => void;
  tarotPreferences: ReactNode;
};

export function UserSettings({
  appearanceOptions,
  locale,
  onOpenHistory,
  onOpenPrivacy,
  onOpenProfile,
  tarotPreferences,
}: UserSettingsProps) {
  const { announcement, changeTheme, theme, storageError } = useUserSettings({ locale });
  const copy = userSettingsCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('settings-title'), []);

  return (
    <div className={styles.root}>
      <SettingsHero copy={copy.hero} onBack={onOpenProfile} />
      <AppearanceSettingsSection
        copy={copy.appearance}
        onChange={changeTheme}
        options={appearanceOptions}
        value={theme}
        storageError={storageError}
        onRetry={() => changeTheme(theme)}
        retryLabel={copy.appearance.retry}
      />
      {tarotPreferences}
      <LocalDataSection
        copy={copy.data}
        onOpenHistory={onOpenHistory}
        onOpenPrivacy={onOpenPrivacy}
      />

      <p aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
        {announcement}
      </p>
    </div>
  );
}
