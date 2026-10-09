import { Button, Container, Stack, Typography } from '@shared/ui';

import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type LocalDataSectionProps = {
  copy: UserSettingsCopy['data'];
  onOpenHistory: () => void;
  onOpenPrivacy: () => void;
};

export function LocalDataSection({ copy, onOpenHistory, onOpenPrivacy }: LocalDataSectionProps) {
  return (
    <section aria-labelledby="local-data-settings-title" className={styles.section}>
      <Container size="wide">
        <div className={styles.dataSection}>
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" className={styles.goldEyebrow} variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="local-data-settings-title" variant="heading-lg">
              {copy.title}
            </Typography>
            <Typography className={styles.muted}>{copy.description}</Typography>
          </Stack>

          <div className={styles.dataFacts}>
            <div>
              <Typography as="h3" variant="heading-sm">
                {copy.localTitle}
              </Typography>
              <Typography className={styles.choiceDescription}>{copy.localDescription}</Typography>
            </div>
            <div>
              <Typography as="h3" variant="heading-sm">
                {copy.sessionTitle}
              </Typography>
              <Typography className={styles.choiceDescription}>
                {copy.sessionDescription}
              </Typography>
            </div>
          </div>

          <div className={styles.removalNote}>
            <Typography as="h3" variant="heading-sm">
              {copy.clearTitle}
            </Typography>
            <Typography className={styles.muted}>{copy.clearDescription}</Typography>
          </div>

          <div className={styles.dataActions}>
            <Button onClick={onOpenHistory} prominence="secondary">
              {copy.historyAction}
            </Button>
            <Button onClick={onOpenPrivacy} prominence="quiet">
              {copy.privacyAction}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
