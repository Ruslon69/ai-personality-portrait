import { Button, Card, Container, Stack, Typography } from '@shared/ui';

import type { SettingsAction } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type DataManagementSectionProps = {
  actions: readonly SettingsAction[];
  copy: UserSettingsCopy['data'];
  onAction: (action: SettingsAction, focusTargetId: string) => void;
};

export function DataManagementSection({ actions, copy, onAction }: DataManagementSectionProps) {
  return (
    <section aria-labelledby="data-settings-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="data-settings-title" variant="heading-lg">
              {copy.title}
            </Typography>
            <Typography className={styles.muted}>{copy.description}</Typography>
          </Stack>

          <div className={styles.actionGrid}>
            {actions.map((action) => {
              const buttonId = `data-action-${action.id}`;

              return (
                <Card className={styles.actionCard} key={action.id}>
                  <Stack gap="md">
                    <Stack gap="xs">
                      <Typography as="h3" variant="heading-sm">
                        {action.label}
                      </Typography>
                      <Typography className={styles.muted}>{action.description}</Typography>
                    </Stack>
                    <Button
                      className={action.tone === 'danger' ? styles.dangerOutline : undefined}
                      id={buttonId}
                      onClick={() => onAction(action, buttonId)}
                    >
                      {action.label}
                    </Button>
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
