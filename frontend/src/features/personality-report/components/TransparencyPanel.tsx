import type { ProfileLocale } from '@entities/personality-profile';
import { Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './Explainability.module.css';

const transparencyCopy = {
  es: {
    eyebrow: 'Transparencia',
    title: 'Cómo se ha formado este retrato',
    lead: 'El sistema compara las respuestas que has elegido compartir y propone pequeños pasos prácticos. No utiliza puntuaciones ocultas ni conclusiones al azar.',
    flow: [
      'Se han reunido tus respuestas',
      'Se han comparado los temas recurrentes',
      'Las lecturas opcionales se han mantenido aparte',
      'Se han formado observaciones y siguientes pasos',
    ],
    points: [
      [
        'Busca repeticiones',
        'Encuentra conexiones recurrentes en la información que has elegido compartir.',
      ],
      ['No diagnostica', 'No define tu personalidad como un hecho demostrado.'],
      ['No predice', 'No predice acontecimientos ni promete un resultado futuro.'],
      [
        'Separa las fuentes',
        'Las lecturas de numerología, zodiaco y astrología se identifican con claridad.',
      ],
      ['Tú tienes la última palabra', 'Tú decides qué observaciones te resultan útiles.'],
    ],
  },
  en: {
    eyebrow: 'Transparency',
    title: 'How this portrait was assembled',
    lead: 'The system compares the answers you chose to share and suggests small practical steps. It does not use hidden scores or random conclusions.',
    flow: [
      'Your answers were collected',
      'Repeating themes were compared',
      'Optional readings were kept separate',
      'Observations and next steps were formed',
    ],
    points: [
      ['Looks for repetition', 'Finds recurring links in the information you chose to share.'],
      ['Does not diagnose', 'Does not define personality as an established fact.'],
      ['Does not predict', 'Does not predict events or promise a future outcome.'],
      ['Separates sources', 'Numerology, zodiac and astrology readings remain clearly labelled.'],
      ['Leaves judgement to you', 'You decide which observations feel useful.'],
    ],
  },
  ru: {
    eyebrow: 'Прозрачность',
    title: 'Как был создан этот портрет',
    lead: 'Система сопоставляет ваши ответы и предлагает небольшие практические шаги. Скрытых оценок и случайных выводов нет.',
    flow: [
      'Собраны ваши ответы',
      'Сопоставлены повторяющиеся темы',
      'Дополнительные разборы оставлены отдельно',
      'Сформированы наблюдения и следующие шаги',
    ],
    points: [
      ['Ищет повторения', 'Находит связи в информации, которой вы решили поделиться.'],
      ['Не диагностирует', 'Не определяет личность как установленный факт.'],
      ['Не предсказывает будущее', 'Не обещает будущий сценарий или его точность.'],
      ['Разделяет происхождение', 'Разборы по числам и знаку зодиака всегда показаны отдельно.'],
      ['Оставляет решение вам', 'Вы решаете, какие наблюдения действительно полезны.'],
    ],
  },
  uk: {
    eyebrow: 'Прозорість',
    title: 'Як було створено цей портрет',
    lead: 'Система зіставляє ваші відповіді й пропонує невеликі практичні кроки. Прихованих оцінок і випадкових висновків немає.',
    flow: [
      'Зібрано ваші відповіді',
      'Зіставлено повторювані теми',
      'Додаткові розбори залишено окремо',
      'Сформовано спостереження й наступні кроки',
    ],
    points: [
      ['Шукає повторення', 'Знаходить зв’язки в інформації, якою ви вирішили поділитися.'],
      ['Не діагностує', 'Не визначає особистість як встановлений факт.'],
      ['Не передбачає майбутнє', 'Не обіцяє майбутній сценарій або його точність.'],
      ['Розділяє походження', 'Розбори за числами й знаком зодіаку завжди показано окремо.'],
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
