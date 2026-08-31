import type { ThemeMode } from '@app/providers/theme';
import type { Locale } from '@shared/i18n';

import { userSettingsCopy } from '../data';

export function getSettingsThemeLabel(theme: ThemeMode, locale: Locale) {
  return userSettingsCopy[locale].themeLabels[theme];
}
