import { Button, Container, Stack, Surface, Typography } from '@shared/ui';

import type { SettingsAction } from '../types';
import styles from './UserSettingsSections.module.css';

type DangerZoneSectionProps = {
  actions: readonly SettingsAction[];
  onAction: (action: SettingsAction, focusTargetId: string) => void;
};

export function DangerZoneSection({ actions, onAction }: DangerZoneSectionProps) {
  return (
    <section aria-labelledby="danger-zone-title" className={styles.dangerSection}>
      <Container size="wide">
        <Surface className={styles.dangerSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Опасная зона
              </Typography>
              <Typography as="h2" id="danger-zone-title" variant="heading-lg">
                Действия с профилем и всеми данными
              </Typography>
              <Typography className={styles.muted}>
                Каждое действие требует отдельного подтверждения. В демонстрации данные не
                удаляются.
              </Typography>
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
                      className={styles.dangerButton}
                      id={buttonId}
                      onClick={() => onAction(action, buttonId)}
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
