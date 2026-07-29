import { useEffect } from 'react';

import { Container, Progress, Spinner, Stack, Surface, Typography } from '@shared/ui';

import { usePortraitGeneration } from '../hooks';
import { getGenerationStageStatus } from '../utils';
import styles from './PortraitGenerating.module.css';

type PortraitGeneratingProps = {
  onComplete: () => void;
};

export function PortraitGenerating({ onComplete }: PortraitGeneratingProps) {
  const { currentStage, currentStageIndex, progressValue, stages } = usePortraitGeneration({
    onComplete,
  });

  useEffect(() => {
    window.requestAnimationFrame(() => document.getElementById('generating-title')?.focus());
  }, []);

  return (
    <section aria-labelledby="generating-title" className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <Stack align="center" className={styles.introduction} gap="md">
            <Spinner label="Создаём предварительный портрет" size="lg" />
            <Stack align="center" gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Почти готово
              </Typography>
              <Typography as="h1" className={styles.title} id="generating-title" tabIndex={-1}>
                Собираем ваш портрет
              </Typography>
              <Typography className={styles.lead}>
                Последовательно соединяем доступные данные. Ничего не добавляем от себя.
              </Typography>
            </Stack>
          </Stack>

          <Surface className={styles.stageSurface} elevation="low">
            <Stack gap="lg">
              <Progress
                aria-label={`Этап ${progressValue} из ${stages.length}`}
                max={stages.length}
                value={progressValue}
              />

              <Typography
                aria-atomic="true"
                aria-live="polite"
                className={styles.liveStatus}
                role="status"
              >
                {currentStage?.activeTitle}. {currentStage?.description}
              </Typography>

              <ol className={styles.stageList}>
                {stages.map((stage, index) => {
                  const status = getGenerationStageStatus(index, currentStageIndex);
                  const title = status === 'complete' ? stage.completedTitle : stage.activeTitle;

                  return (
                    <li className={styles.stage} data-status={status} key={stage.id}>
                      <span aria-hidden="true" className={styles.marker}>
                        {status === 'complete' ? '✓' : index + 1}
                      </span>
                      <Stack gap="xs">
                        <Typography as="h2" className={styles.stageTitle} variant="heading-sm">
                          {title}
                        </Typography>
                        <Typography className={styles.stageDescription} variant="caption">
                          {stage.description}
                        </Typography>
                        <span className={styles.visuallyHidden}>
                          {status === 'complete'
                            ? 'Завершено'
                            : status === 'current'
                              ? 'Выполняется'
                              : 'Ожидает'}
                        </span>
                      </Stack>
                    </li>
                  );
                })}
              </ol>
            </Stack>
          </Surface>

          <Typography className={styles.note} variant="caption">
            Результат откроется автоматически.
          </Typography>
        </div>
      </Container>
    </section>
  );
}
