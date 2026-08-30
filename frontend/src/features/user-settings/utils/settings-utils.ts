import type { ThemeMode } from '@app/providers/theme';
import type { Locale } from '@shared/i18n';

import { userSettingsCopy } from '../data';
import type {
  CompatibilityInvitation,
  InvitationConsentStatus,
  SettingsConsentId,
  SettingsConsentValues,
} from '../types';

export function createDefaultConsentValues(): SettingsConsentValues {
  return {
    marketing: false,
    'product-improvement': false,
    'voice-storage': false,
  };
}

export function updateConsentValue(
  values: SettingsConsentValues,
  id: SettingsConsentId,
  enabled: boolean,
): SettingsConsentValues {
  return { ...values, [id]: enabled };
}

export function formatInvitationDate(value: string, locale: Locale) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? userSettingsCopy[locale].dateUnavailable
    : new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'uk' ? 'uk-UA' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
}

export function getInvitationStatusLabel(status: InvitationConsentStatus, locale: Locale) {
  return userSettingsCopy[locale].invitationStatuses[status];
}

export function getSettingsThemeLabel(theme: ThemeMode, locale: Locale) {
  return userSettingsCopy[locale].themeLabels[theme];
}

export function revokeCompatibilityInvitation(
  invitations: readonly CompatibilityInvitation[],
  invitationId: string,
) {
  return invitations.map((invitation) =>
    invitation.id === invitationId ? { ...invitation, status: 'revoked' as const } : invitation,
  );
}
