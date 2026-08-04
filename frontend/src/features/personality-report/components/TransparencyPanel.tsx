import type { ProfileLocale } from '@entities/personality-profile';
import { Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './Explainability.module.css';

const transparencyCopy = {
  en: {
    eyebrow: 'Transparency',
    title: 'How this portrait was assembled',
    lead: 'The system compares patterns in the signals you chose to share and offers small practical experiments — without hidden percentages or random conclusions.',
    flow: [
      'Selected signals were collected',
      'Repeating themes were compared',
      'Optional interpretations were kept separate',
      'Observations and next steps were formed',
    ],
    points: [
      ['Looks for patterns', 'Finds recurring links in voluntarily provided information.'],
      ['Does not diagnose', 'Does not define personality as an established fact.'],
      ['Does not predict', 'Does not predict events or promise a future outcome.'],
      ['Separates origins', 'Numerology, zodiac and astrology remain labelled interpretations.'],
      ['Leaves judgement to you', 'You decide which observations feel useful.'],
    ],
  },
  ru: {
    eyebrow: 'Прозрачность',
    title: 'Как был создан этот портрет',
    lead: 'Система сопоставляет паттерны в выбранных вами сигналах и предлагает небольшие практические эксперименты — без скрытых процентов и случайных выводов.',
    flow: [
      'Собраны выбранные сигналы',
      'Сопоставлены повторяющиеся темы',
      'Добровольные интерпретации оставлены отдельно',
      'Сформированы наблюдения и следующие шаги',
    ],
    points: [
      ['Замечает паттерны', 'Ищет повторяющиеся связи в добровольно предоставленных данных.'],
      ['Не диагностирует', 'Не определяет личность как установленный факт.'],
      ['Не предсказывает будущее', 'Не обещает будущий сценарий или его точность.'],
      [
        'Разделяет происхождение',
        'Нумерология, зодиак и астрология остаются отмеченными интерпретациями.',
      ],
      ['Оставляет решение вам', 'Вы решаете, какие наблюдения действительно полезны.'],
    ],
  },
  uk: {
    eyebrow: 'Прозорість',
    title: 'Як було створено цей портрет',
    lead: 'Система зіставляє патерни в обраних вами сигналах і пропонує невеликі практичні експерименти — без прихованих відсотків і випадкових висновків.',
    flow: [
      'Зібрано обрані сигнали',
      'Зіставлено повторювані теми',
      'Добровільні інтерпретації залишено окремо',
      'Сформовано спостереження й наступні кроки',
    ],
    points: [
      ['Помічає патерни', 'Шукає повторювані зв’язки в добровільно наданих даних.'],
      ['Не діагностує', 'Не визначає особистість як встановлений факт.'],
      ['Не передбачає майбутнє', 'Не обіцяє майбутній сценарій або його точність.'],
      [
        'Розділяє походження',
        'Нумерологія, зодіак і астрологія залишаються позначеними інтерпретаціями.',
      ],
      ['Залишає рішення вам', 'Ви вирішуєте, які спостереження справді корисні.'],
    ],
  },
} as const;

export function TransparencyPanel({ locale = 'ru' }: { locale?: ProfileLocale }) {
  const copy = transparencyCopy[locale];
  return (
    <section aria-labelledby="transparency-title" className={styles.transparencySection}>
      <Container size="wide">
        <Surface className={styles.transparencyPanel} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.transparencyHeading} gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="transparency-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.transparencyLead}>{copy.lead}</Typography>
            </Stack>

            <ol className={styles.transparencyFlow}>
              {copy.flow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>

            <div className={styles.transparencyGrid}>
              {copy.points.map(([title, description]) => (
                <article className={styles.transparencyPoint} key={title}>
                  <Typography as="h3" variant="heading-sm">
                    {title}
                  </Typography>
                  <Typography>{description}</Typography>
                </article>
              ))}
            </div>
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}
