import { Button, Card, Container, Stack, Typography } from '@shared/ui';
import type { ProfileLocale } from '@entities/personality-profile';

import styles from './UserProfileSections.module.css';

type QuickActionsSectionProps = {
  locale: ProfileLocale;
  onCreatePortrait: () => void;
  onOpenCompatibility: () => void;
  onOpenHistory: () => void;
  onOpenPortrait: () => void;
  onOpenSettings: () => void;
};

const copy = {
  es: {
    eyebrow: 'Más opciones',
    title: '¿Qué te gustaría hacer ahora?',
    actions: [
      ['portrait', 'Abrir reflexión completa', 'Vuelve a tu resultado detallado.'],
      ['create', 'Crear una nueva reflexión', 'Responde las preguntas de nuevo.'],
      ['history', 'Abrir historial', 'Consulta tus resultados guardados.'],
      ['compatibility', 'Explorar compatibilidad', 'Abre la experiencia para dos personas.'],
      ['settings', 'Abrir ajustes', 'Gestiona la aplicación y tus datos.'],
    ],
  },
  en: {
    eyebrow: 'More options',
    title: 'What would you like to do next?',
    actions: [
      ['portrait', 'Open full reflection', 'Return to your detailed result.'],
      ['create', 'Create a new reflection', 'Answer the questions again.'],
      ['history', 'Open history', 'See your saved results.'],
      ['compatibility', 'Explore compatibility', 'Open the experience for two people.'],
      ['settings', 'Open settings', 'Manage the application and your data.'],
    ],
  },
  ru: {
    eyebrow: 'Другие действия',
    title: 'Что хотите сделать дальше?',
    actions: [
      ['portrait', 'Открыть полный разбор', 'Вернуться к подробному результату.'],
      ['create', 'Создать новый разбор', 'Ответить на вопросы ещё раз.'],
      ['history', 'Открыть историю', 'Посмотреть сохранённые результаты.'],
      ['compatibility', 'Проверить совместимость', 'Открыть разбор для двух людей.'],
      ['settings', 'Открыть настройки', 'Управлять приложением и данными.'],
    ],
  },
  uk: {
    eyebrow: 'Інші дії',
    title: 'Що хочете зробити далі?',
    actions: [
      ['portrait', 'Відкрити повний розбір', 'Повернутися до докладного результату.'],
      ['create', 'Створити новий розбір', 'Відповісти на запитання ще раз.'],
      ['history', 'Відкрити історію', 'Переглянути збережені результати.'],
      ['compatibility', 'Перевірити сумісність', 'Відкрити розбір для двох людей.'],
      ['settings', 'Відкрити налаштування', 'Керувати застосунком і даними.'],
    ],
  },
} as const;

export function QuickActionsSection({
  locale,
  onCreatePortrait,
  onOpenCompatibility,
  onOpenHistory,
  onOpenPortrait,
  onOpenSettings,
}: QuickActionsSectionProps) {
  const text = copy[locale];
  const handlers = {
    compatibility: onOpenCompatibility,
    create: onCreatePortrait,
    history: onOpenHistory,
    portrait: onOpenPortrait,
    settings: onOpenSettings,
  } as const;

  return (
    <section aria-labelledby="quick-actions-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {text.eyebrow}
            </Typography>
            <Typography as="h2" id="quick-actions-title" variant="heading-lg">
              {text.title}
            </Typography>
          </Stack>

          <div className={styles.actionGrid}>
            {text.actions.map(([id, label, description]) => (
              <Card className={styles.actionCard} key={id}>
                <Stack gap="md">
                  <Stack gap="xs">
                    <Typography as="h3" variant="heading-sm">
                      {label}
                    </Typography>
                    <Typography className={styles.muted}>{description}</Typography>
                  </Stack>
                  <Button onClick={handlers[id]}>{label}</Button>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
