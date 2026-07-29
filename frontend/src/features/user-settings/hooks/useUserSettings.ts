import { useEffect, useState } from 'react';

import { useTheme } from '@app';

import type {
  CompatibilityInvitation,
  PendingSettingsAction,
  SettingsAction,
  SettingsConsentId,
} from '../types';
import {
  createDefaultConsentValues,
  getSettingsThemeLabel,
  revokeCompatibilityInvitation,
  updateConsentValue,
} from '../utils';

type UseUserSettingsOptions = {
  initialInvitations: readonly CompatibilityInvitation[];
};

export function useUserSettings({ initialInvitations }: UseUserSettingsOptions) {
  const { setTheme, theme } = useTheme();
  const [consents, setConsents] = useState(createDefaultConsentValues);
  const [invitations, setInvitations] = useState<readonly CompatibilityInvitation[]>(() => [
    ...initialInvitations,
  ]);
  const [pendingAction, setPendingAction] = useState<PendingSettingsAction | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

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
    setAnnouncement(`Тема изменена: ${getSettingsThemeLabel(nextTheme)}.`);
  };

  const changeConsent = (id: SettingsConsentId, enabled: boolean) => {
    setConsents((current) => updateConsentValue(current, id, enabled));
    setAnnouncement(enabled ? 'Отдельное согласие включено.' : 'Отдельное согласие выключено.');
  };

  const runAction = (action: SettingsAction, returnFocusId: string) => {
    if (action.confirmation) {
      setPendingAction({ action, focusTargetId: returnFocusId });
      return;
    }

    setAnnouncement(action.resultMessage);
    setFocusTargetId(returnFocusId);
  };

  const requestInvitationRevocation = (
    invitation: CompatibilityInvitation,
    returnFocusId: string,
  ) => {
    const action: SettingsAction = {
      confirmation: {
        confirmLabel: 'Отозвать приглашение',
        description: `Приглашение «${invitation.recipient}» станет недоступно в этой локальной демонстрации.`,
        title: 'Отозвать приглашение?',
      },
      description: 'Локальный отзыв приглашения.',
      id: 'revoke-invitation',
      label: 'Отозвать приглашение',
      resultMessage: `Приглашение «${invitation.recipient}» отозвано локально.`,
      tone: 'danger',
    };

    setPendingAction({
      action,
      focusTargetId: returnFocusId,
      invitationId: invitation.id,
    });
  };

  const cancelPendingAction = () => {
    if (pendingAction) {
      setFocusTargetId(pendingAction.focusTargetId);
    }

    setPendingAction(null);
    setAnnouncement('Действие отменено. Настройки не изменились.');
  };

  const confirmPendingAction = () => {
    if (!pendingAction) {
      return;
    }

    const invitationId = pendingAction.invitationId;

    if (pendingAction.action.id === 'revoke-invitation' && invitationId) {
      setInvitations((current) => revokeCompatibilityInvitation(current, invitationId));
    }

    setAnnouncement(pendingAction.action.resultMessage);
    setFocusTargetId(pendingAction.focusTargetId);
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
