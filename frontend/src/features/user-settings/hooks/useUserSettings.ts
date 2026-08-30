import { useEffect, useState } from 'react';

import { useTheme } from '@app/providers/theme';
import type { Locale } from '@shared/i18n';

import type {
  CompatibilityInvitation,
  InvitationConsentStatus,
  PendingSettingsAction,
  SettingsAction,
  SettingsConsentId,
} from '../types';
import { createDefaultConsentValues, getSettingsThemeLabel, updateConsentValue } from '../utils';
import { userSettingsCopy } from '../data';

type UseUserSettingsOptions = {
  initialInvitations: readonly CompatibilityInvitation[];
  locale: Locale;
};

export function useUserSettings({ initialInvitations, locale }: UseUserSettingsOptions) {
  const copy = userSettingsCopy[locale];
  const { setTheme, theme } = useTheme();
  const [consents, setConsents] = useState(createDefaultConsentValues);
  const [invitationStatuses, setInvitationStatuses] = useState<
    Readonly<Record<string, InvitationConsentStatus>>
  >({});
  const [pendingAction, setPendingAction] = useState<PendingSettingsAction | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  const invitations = initialInvitations.map((invitation) => ({
    ...invitation,
    status: invitationStatuses[invitation.id] ?? invitation.status,
  }));

  useEffect(() => {
    if (!focusTargetId) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      document.getElementById(focusTargetId)?.focus();
      setFocusTargetId((current) => (current === focusTargetId ? null : current));
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [focusTargetId]);

  const changeTheme = (nextTheme: Parameters<typeof setTheme>[0]) => {
    setTheme(nextTheme);
    setAnnouncement(copy.announcements.themeChanged(getSettingsThemeLabel(nextTheme, locale)));
  };

  const changeConsent = (id: SettingsConsentId, enabled: boolean) => {
    setConsents((current) => updateConsentValue(current, id, enabled));
    setAnnouncement(
      enabled ? copy.announcements.consentEnabled : copy.announcements.consentDisabled,
    );
  };

  const runAction = (action: SettingsAction, returnFocusId: string) => {
    if (action.confirmation) {
      setPendingAction({
        action,
        cancelFocusTargetId: returnFocusId,
        confirmFocusTargetId: returnFocusId,
      });
      return;
    }

    setAnnouncement(action.resultMessage);
    setFocusTargetId(returnFocusId);
  };

  const requestInvitationRevocation = (
    invitation: CompatibilityInvitation,
    returnFocusId: string,
  ) => {
    const invitationCopy = copy.compatibility.revokeConfirmation(invitation.recipient);
    const { resultMessage, ...confirmation } = invitationCopy;
    const action: SettingsAction = {
      confirmation,
      description: copy.compatibility.revoke,
      id: 'revoke-invitation',
      label: copy.compatibility.revoke,
      resultMessage,
      tone: 'danger',
    };

    setPendingAction({
      action,
      cancelFocusTargetId: returnFocusId,
      confirmFocusTargetId: 'compatibility-settings-title',
      invitationId: invitation.id,
    });
  };

  const cancelPendingAction = () => {
    if (pendingAction) {
      setFocusTargetId(pendingAction.cancelFocusTargetId);
    }

    setPendingAction(null);
    setAnnouncement(copy.announcements.cancelled);
  };

  const confirmPendingAction = () => {
    if (!pendingAction) {
      return;
    }

    const invitationId = pendingAction.invitationId;

    if (pendingAction.action.id === 'revoke-invitation' && invitationId) {
      setInvitationStatuses((current) => ({ ...current, [invitationId]: 'revoked' }));
    }

    setAnnouncement(pendingAction.action.resultMessage);
    setFocusTargetId(pendingAction.confirmFocusTargetId);
    setPendingAction(null);
  };

  return {
    announcement,
    cancelPendingAction,
    changeConsent,
    changeTheme,
    confirmPendingAction,
    consents,
    invitations,
    pendingAction,
    requestInvitationRevocation,
    runAction,
    theme,
  };
}
