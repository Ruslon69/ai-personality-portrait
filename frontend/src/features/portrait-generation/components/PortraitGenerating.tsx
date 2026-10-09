import { generatingCopy } from './../data/generating-copy';
import { useEffect, useMemo } from 'react';

import type { DraftPortrait, ProfileLocale } from '@entities/personality-profile';
import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Container, Stack, Surface, Typography } from '@shared/ui';

import { createGenerationStages } from '../config';
import { usePortraitGeneration } from '../hooks';
import { getGenerationStageStatus } from '../utils';
import styles from './PortraitGenerating.module.css';
import { GenerationAssembly } from './GenerationAssembly';

type PortraitGeneratingProps = {
  draft: DraftPortrait;
  locale: ProfileLocale;
  onComplete: () => void;
};

export function PortraitGenerating({ draft, locale, onComplete }: PortraitGeneratingProps) {
  const generationStages = useMemo(() => createGenerationStages(draft, locale), [draft, locale]);
  const { currentStage, currentStageIndex, stages } = usePortraitGeneration({
    onComplete,
    stages: generationStages,
  });
  const copy = generatingCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('generating-title'), []);

  return (
    <section aria-labelledby="generating-title" className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <Stack align="center" className={styles.introduction} gap="md">
            <GenerationAssembly
              draft={draft}
              locale={locale}
              stageCount={stages.length}
              stageIndex={currentStageIndex}
            />
            <Stack align="center" gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography
                as="h1"
                className={styles.title}
                id="generating-title"
                tabIndex={-1}
                variant="flow-title"
              >
                {copy.title}
              </Typography>
              <Typography className={styles.lead} variant="flow-lead">
                {copy.lead}
              </Typography>
            </Stack>
          </Stack>

          <Surface className={styles.stageSurface} elevation="low">
            <Stack gap="lg">
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
                            ? copy.complete
                            : status === 'current'
                              ? copy.current
                              : copy.pending}
                        </span>
                      </Stack>
                    </li>
                  );
                })}
              </ol>
            </Stack>
          </Surface>

          <Typography className={styles.note} variant="caption">
            {copy.note}
          </Typography>
        </div>
      </Container>
    </section>
  );
}
