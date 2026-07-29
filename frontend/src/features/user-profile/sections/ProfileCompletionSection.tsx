import { Badge, Card, Container, Progress, Stack, Typography } from '@shared/ui';

import { useProfileCompletion } from '../hooks';
import type { ProfileCompletionItem } from '../types';
import { getCompletionStatusLabel } from '../utils';
import styles from './UserProfileSections.module.css';

type ProfileCompletionSectionProps = {
  items: readonly ProfileCompletionItem[];
};

export function ProfileCompletionSection({ items }: ProfileCompletionSectionProps) {
  const { completedCount, summary, totalCount } = useProfileCompletion(items);

  return (
    <section aria-labelledby="profile-completion-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" className={styles.eyebrow} variant="caption">
              Заполнение профиля
            </Typography>
            <Typography as="h2" id="profile-completion-title" variant="heading-lg">
              Какие источники уже добавлены
            </Typography>
            <Typography className={styles.muted}>
              Это прогресс заполнения, а не оценка точности личности.
            </Typography>
          </Stack>

          <Stack gap="md">
            <Stack gap="sm">
              <Typography aria-live="polite">{summary}</Typography>
              <Progress aria-label={summary} max={totalCount} value={completedCount} />
            </Stack>

            <div className={styles.completionGrid}>
              {items.map((item) => (
                <Card
                  aria-labelledby={`${item.id}-completion-title`}
                  className={styles.completionCard}
                  key={item.id}
                >
                  <Stack gap="sm">
                    <Stack align="center" direction="row" justify="between">
                      <Typography as="h3" id={`${item.id}-completion-title`} variant="heading-sm">
                        {item.label}
                      </Typography>
                      <Badge tone={item.status === 'complete' ? 'success' : 'neutral'}>
                        {getCompletionStatusLabel(item.status)}
                      </Badge>
                    </Stack>
                    <Typography className={styles.muted}>{item.description}</Typography>
                  </Stack>
                </Card>
              ))}
            </div>
          </Stack>
        </Stack>
      </Container>
    </section>
  );
}
