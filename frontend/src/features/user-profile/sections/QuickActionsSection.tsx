import { Button, Card, Container, Stack, Typography } from '@shared/ui';

import styles from './UserProfileSections.module.css';

type QuickActionsSectionProps = {
  onCreatePortrait: () => void;
  onOpenCompatibility: () => void;
  onOpenHistory: () => void;
  onOpenPortrait: () => void;
  onOpenSettings: () => void;
};

const actions = [
  {
    description: 'Вернуться к подробному разбору.',
    id: 'portrait',
    label: 'Открыть полный портрет',
  },
  {
    description: 'Пройти короткий путь ещё раз.',
    id: 'create',
    label: 'Создать новый портрет',
  },
  {
    description: 'Посмотреть сохранённые результаты.',
    id: 'history',
    label: 'Открыть историю',
  },
  {
    description: 'Перейти к сценарию для двух людей.',
    id: 'compatibility',
    label: 'Начать совместимость',
  },
  {
    description: 'Управлять приложением и данными.',
    id: 'settings',
    label: 'Перейти в настройки',
  },
] as const;

export function QuickActionsSection({
  onCreatePortrait,
  onOpenCompatibility,
  onOpenHistory,
  onOpenPortrait,
  onOpenSettings,
}: QuickActionsSectionProps) {
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
              Быстрые действия
            </Typography>
            <Typography as="h2" id="quick-actions-title" variant="heading-lg">
              Куда перейти дальше
            </Typography>
          </Stack>

          <div className={styles.actionGrid}>
            {actions.map((action) => (
              <Card className={styles.actionCard} key={action.id}>
                <Stack gap="md">
                  <Stack gap="xs">
                    <Typography as="h3" variant="heading-sm">
                      {action.label}
                    </Typography>
                    <Typography className={styles.muted}>{action.description}</Typography>
                  </Stack>
                  <Button onClick={handlers[action.id]}>{action.label}</Button>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
