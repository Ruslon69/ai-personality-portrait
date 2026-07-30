import { Badge, Button, Card, Container, Stack, Typography } from '@shared/ui';

import type { CompatibilityInvitation } from '../types';
import { formatInvitationDate, getInvitationStatusLabel } from '../utils';
import styles from './UserSettingsSections.module.css';

type CompatibilitySettingsSectionProps = {
  invitations: readonly CompatibilityInvitation[];
  onRevoke: (invitation: CompatibilityInvitation, focusTargetId: string) => void;
};

export function CompatibilitySettingsSection({
  invitations,
  onRevoke,
}: CompatibilitySettingsSectionProps) {
  return (
    <section aria-labelledby="compatibility-settings-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              Совместимость
            </Typography>
            <Typography
              as="h2"
              id="compatibility-settings-title"
              tabIndex={-1}
              variant="heading-lg"
            >
              Активные приглашения
            </Typography>
            <Typography className={styles.muted}>
              Согласие относится только к конкретному приглашению и может быть отозвано.
            </Typography>
          </Stack>

          <div className={styles.invitationGrid}>
            {invitations.map((invitation) => {
              const buttonId = `revoke-${invitation.id}`;
              const isRevoked = invitation.status === 'revoked';

              return (
                <Card
                  aria-labelledby={`${invitation.id}-title`}
                  className={styles.invitationCard}
                  key={invitation.id}
                >
                  <Stack gap="md">
                    <Stack align="center" direction="row" justify="between" wrap>
                      <Typography className={styles.muted} variant="caption">
                        <time dateTime={invitation.createdAt}>
                          {formatInvitationDate(invitation.createdAt)}
                        </time>
                      </Typography>
                      <Badge tone={isRevoked ? 'neutral' : 'info'}>
                        {getInvitationStatusLabel(invitation.status)}
                      </Badge>
                    </Stack>
                    <Stack gap="xs">
                      <Typography as="h3" id={`${invitation.id}-title`} variant="heading-sm">
                        {invitation.recipient}
                      </Typography>
                      <Typography className={styles.muted}>{invitation.label}</Typography>
                    </Stack>
                    {isRevoked ? (
                      <Typography variant="caption">
                        Новые открытия по ссылке недоступны.
                      </Typography>
                    ) : (
                      <Button
                        className={styles.dangerOutline}
                        id={buttonId}
                        onClick={() => onRevoke(invitation, 'compatibility-settings-title')}
                      >
                        Отозвать приглашение
                      </Button>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
