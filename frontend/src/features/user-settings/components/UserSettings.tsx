import { useEffect, type ReactNode } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { Locale } from '@shared/i18n';

import { AppearanceSettingsSection, SettingsHero } from '../sections';
import { useUserSettings } from '../hooks';
import { userSettingsCopy } from '../data';
import type { AppearanceOption } from '../types';
import styles from './UserSettings.module.css';

type UserSettingsProps = {
  appearanceOptions: readonly AppearanceOption[];
  locale: Locale;
  tarotPreferences: ReactNode;
};

export function UserSettings({ appearanceOptions, locale, tarotPreferences }: UserSettingsProps) {
  const { announcement, changeTheme, theme } = useUserSettings({ locale });
  const copy = userSettingsCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('settings-title'), []);

  return (
    <div className={styles.root}>
      <SettingsHero copy={copy.hero} />
      <AppearanceSettingsSection
        copy={copy.appearance}
        onChange={changeTheme}
        options={appearanceOptions}
        value={theme}
      />
      {tarotPreferences}

      <p aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
        {announcement}
      </p>
    </div>
  );
}
