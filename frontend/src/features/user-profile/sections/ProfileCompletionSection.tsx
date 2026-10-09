import { Badge, Card, Container, Progress, Stack, Typography } from '@shared/ui';
import type { ProfileCompletionItem } from '@entities/personality-profile';
import type { ProfileLocale } from '@entities/personality-profile';

import { useProfileCompletion } from '../hooks';
import { getCompletionStatusLabel } from '../utils';
import styles from './UserProfileSections.module.css';

type ProfileCompletionSectionProps = {
  items: readonly ProfileCompletionItem[];
  locale: ProfileLocale;
};

export function ProfileCompletionSection({ items, locale }: ProfileCompletionSectionProps) {
  const { completedCount, summary, totalCount } = useProfileCompletion(items, locale);
  const copy = {
    es: {
      eyebrow: 'Información incluida',
      title: 'Lo que ya has añadido',
      description:
        'Esto muestra lo que has añadido, no la precisión con la que el retrato te define.',
    },
    en: {
      eyebrow: 'Included information',
      title: 'What is already included',
      description: 'This shows what you added, not how accurately the portrait defines you.',
    },
    ru: {
      eyebrow: 'Добавленные данные',
      title: 'Что уже вошло в разбор',
      description: 'Здесь показано, что вы добавили, а не насколько точно портрет определяет вас.',
    },
    uk: {
      eyebrow: 'Додані дані',
      title: 'Що вже увійшло до розбору',
      description: 'Тут показано, що ви додали, а не наскільки точно портрет визначає вас.',
    },
  }[locale];

  return (
    <section aria-labelledby="profile-completion-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="profile-completion-title" variant="heading-lg">
              {copy.title}
            </Typography>
            <Typography className={styles.muted}>{copy.description}</Typography>
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
                        {getCompletionStatusLabel(item.status, locale)}
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
