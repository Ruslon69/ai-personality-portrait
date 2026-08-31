import { useState } from 'react';

import { useTheme } from '@app/providers/theme';
import type { Locale } from '@shared/i18n';

import { userSettingsCopy } from '../data';
import { getSettingsThemeLabel } from '../utils';

type UseUserSettingsOptions = {
  locale: Locale;
};

export function useUserSettings({ locale }: UseUserSettingsOptions) {
  const copy = userSettingsCopy[locale];
  const { setTheme, theme } = useTheme();
  const [announcement, setAnnouncement] = useState('');

  const changeTheme = (nextTheme: Parameters<typeof setTheme>[0]) => {
    setTheme(nextTheme);
    setAnnouncement(copy.announcements.themeChanged(getSettingsThemeLabel(nextTheme, locale)));
  };

  return {
    announcement,
    changeTheme,
    theme,
  };
}
