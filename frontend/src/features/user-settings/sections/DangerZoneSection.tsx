import { Button, Container, Stack, Surface, Typography } from '@shared/ui';

import type { SettingsAction } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type DangerZoneSectionProps = {
  actions: readonly SettingsAction[];
  copy: UserSettingsCopy['danger'];
  onAction: (action: SettingsAction, focusTargetId: string) => void;
};

export function DangerZoneSection({ actions, copy, onAction }: DangerZoneSectionProps) {
  return (
    <section aria-labelledby="danger-zone-title" className={styles.dangerSection}>
      <Container size="wide">
        <Surface className={styles.dangerSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="danger-zone-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.description}</Typography>
            </Stack>

            <div className={styles.dangerActions}>
              {actions.map((action) => {
                const buttonId = `danger-action-${action.id}`;

                return (
                  <div className={styles.dangerAction} key={action.id}>
                    <Stack gap="xs">
                      <Typography as="h3" variant="heading-sm">
                        {action.label}
                      </Typography>
                      <Typography className={styles.muted}>{action.description}</Typography>
                    </Stack>
                    <Button
                      id={buttonId}
                      onClick={() => onAction(action, buttonId)}
                      prominence="danger"
                    >
                      {action.label}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}
