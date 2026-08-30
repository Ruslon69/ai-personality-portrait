import { Badge, Button, Card, Container, Stack, Typography } from '@shared/ui';
import type { Locale } from '@shared/i18n';

import type { UserSettingsCopy } from '../data';
import type { CompatibilityInvitation } from '../types';
import { formatInvitationDate, getInvitationStatusLabel } from '../utils';
import styles from './UserSettingsSections.module.css';

type CompatibilitySettingsSectionProps = {
  copy: UserSettingsCopy['compatibility'];
  invitations: readonly CompatibilityInvitation[];
  locale: Locale;
  onRevoke: (invitation: CompatibilityInvitation, focusTargetId: string) => void;
};

export function CompatibilitySettingsSection({
  copy,
  invitations,
  locale,
  onRevoke,
}: CompatibilitySettingsSectionProps) {
  return (
    <section aria-labelledby="compatibility-settings-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography
              as="h2"
              id="compatibility-settings-title"
              tabIndex={-1}
              variant="heading-lg"
            >
              {copy.title}
            </Typography>
            <Typography className={styles.muted}>{copy.description}</Typography>
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
                          {formatInvitationDate(invitation.createdAt, locale)}
                        </time>
                      </Typography>
                      <Badge tone={isRevoked ? 'neutral' : 'info'}>
                        {getInvitationStatusLabel(invitation.status, locale)}
                      </Badge>
                    </Stack>
                    <Stack gap="xs">
                      <Typography as="h3" id={`${invitation.id}-title`} variant="heading-sm">
                        {invitation.recipient}
                      </Typography>
                      <Typography className={styles.muted}>{invitation.label}</Typography>
                    </Stack>
                    {isRevoked ? (
                      <Typography variant="caption">{copy.newLinksUnavailable}</Typography>
                    ) : (
                      <Button
                        className={styles.dangerOutline}
                        id={buttonId}
                        onClick={() => onRevoke(invitation, buttonId)}
                      >
                        {copy.revoke}
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
