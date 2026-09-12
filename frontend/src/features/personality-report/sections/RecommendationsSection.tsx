import { Container, Stack, Typography } from '@shared/ui';
import type { PersonalityRecommendation, ProfileLocale } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type RecommendationsSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly PersonalityRecommendation[];
  locale?: ProfileLocale;
  onToggle: (id: string) => void;
};

export function RecommendationsSection({
  isExpanded,
  items,
  locale = 'ru',
  onToggle,
}: RecommendationsSectionProps) {
  const copy = {
    en: [
      'Practical suggestions',
      'Small actions for real situations',
      'Open only the ideas that feel useful now. You do not need to try everything.',
    ],
    ru: [
      'Практические советы',
      'Небольшие действия для реальных ситуаций',
      'Открывайте только те идеи, которые актуальны сейчас. Необязательно применять всё.',
    ],
    uk: [
      'Практичні поради',
      'Невеликі дії для реальних ситуацій',
      'Відкривайте лише ті ідеї, які актуальні зараз. Необов’язково пробувати все.',
    ],
  }[locale];
  return (
    <section aria-labelledby="recommendations-section-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy[0]}
            </Typography>
            <Typography as="h2" id="recommendations-section-title" variant="heading-lg">
              {copy[1]}
            </Typography>
            <Typography className={styles.muted}>{copy[2]}</Typography>
          </Stack>

          <div className={styles.recommendationGrid}>
            {items.map((item, index) => (
              <ExplainCard
                badge={item.actionLabel}
                expanded={isExpanded(item.id)}
                insight={item}
                locale={locale}
                key={item.id}
                onToggle={onToggle}
                order={index}
              />
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
