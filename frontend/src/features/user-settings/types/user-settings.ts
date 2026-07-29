import type { ThemeMode } from '@app';

export type SettingsConsentId = 'voice-storage' | 'product-improvement' | 'marketing';

export type SettingsConsent = {
  description: string;
  id: SettingsConsentId;
  label: string;
};

export type SettingsConsentValues = Record<SettingsConsentId, boolean>;

export type SettingsActionTone = 'neutral' | 'danger';

export type SettingsConfirmation = {
  confirmLabel: string;
  description: string;
  title: string;
};

export type SettingsAction = {
  confirmation?: SettingsConfirmation;
  description: string;
  id: string;
  label: string;
  resultMessage: string;
  tone: SettingsActionTone;
};

export type InvitationConsentStatus = 'accepted' | 'awaiting-consent' | 'revoked';

export type CompatibilityInvitation = {
  createdAt: string;
  id: string;
  label: string;
  recipient: string;
  status: InvitationConsentStatus;
};

export type SettingsAccount = {
  description: string;
  label: string;
  mode: 'guest' | 'demo-profile';
};

export type PendingSettingsAction = {
  action: SettingsAction;
  focusTargetId: string;
  invitationId?: string;
};

export type AppearanceOption = {
  description: string;
  label: string;
  value: ThemeMode;
};
