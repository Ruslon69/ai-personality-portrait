import type { ThemeMode } from '@app/providers/theme';

import type {
  CompatibilityInvitation,
  InvitationConsentStatus,
  SettingsConsentId,
  SettingsConsentValues,
} from '../types';

const invitationDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const invitationStatusLabels: Record<InvitationConsentStatus, string> = {
  accepted: 'Согласие получено',
  'awaiting-consent': 'Согласие ожидается',
  revoked: 'Приглашение отозвано',
};

const themeLabels: Record<ThemeMode, string> = {
  dark: 'тёмная',
  light: 'светлая',
  system: 'системная',
};

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

export function formatInvitationDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Дата не указана' : invitationDateFormatter.format(date);
}

export function getInvitationStatusLabel(status: InvitationConsentStatus) {
  return invitationStatusLabels[status];
}

export function getSettingsThemeLabel(theme: ThemeMode) {
  return themeLabels[theme];
}

export function revokeCompatibilityInvitation(
  invitations: readonly CompatibilityInvitation[],
  invitationId: string,
) {
  return invitations.map((invitation) =>
    invitation.id === invitationId ? { ...invitation, status: 'revoked' as const } : invitation,
  );
}
