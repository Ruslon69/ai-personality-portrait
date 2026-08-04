import { useEffect, useId, useRef, useState } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { useI18n } from '@shared/i18n';
import { Button, Card, Container, Stack, Typography } from '@shared/ui';

import { useQuestionnaire } from '../hooks';
import { questionnaireCopy } from '../data';
import type { QuestionnaireQuestion, QuestionnaireResponses } from '../types';
import { QuestionOptionCard } from './QuestionOptionCard';
import { PortraitProgress } from './PortraitProgress';
import { QuestionScene } from './QuestionScene';
import styles from './Questionnaire.module.css';

type QuestionnaireProps = {
  initialIndex?: number;
  onComplete: (responses: QuestionnaireResponses) => void;
  onResponsesChange: (responses: QuestionnaireResponses) => void;
  questions: readonly QuestionnaireQuestion[];
  responses: QuestionnaireResponses;
};

export function Questionnaire({
  initialIndex,
  onComplete,
  onResponsesChange,
  questions,
  responses,
}: QuestionnaireProps) {
  const {
    canContinue,
    continueQuestionnaire,
    currentIndex,
    currentQuestion,
    currentResponse,
    isFirstQuestion,
    previousQuestion,
    selectOption,
    skipQuestion,
  } = useQuestionnaire({
    onComplete,
    initialIndex,
    onResponsesChange,
    questions,
    responses,
  });
  const previousQuestionIdRef = useRef(currentQuestion?.id);
  const { locale } = useI18n();
  const copy = questionnaireCopy[locale];
  const instanceId = useId();
  const questionTitleId = `${instanceId}-question-title`;
  const confirmationTimerRef = useRef<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!currentQuestion || previousQuestionIdRef.current === currentQuestion.id) {
      return;
    }

    previousQuestionIdRef.current = currentQuestion.id;
    return focusElementByIdOnNextFrame(questionTitleId);
  }, [currentQuestion, questionTitleId]);

  useEffect(
    () => () => {
      if (confirmationTimerRef.current !== null) window.clearTimeout(confirmationTimerRef.current);
    },
    [],
  );

  if (!currentQuestion) {
    return null;
  }

  const selectedOptionIds = currentResponse?.optionIds ?? [];
  const questionDescriptionId = `${instanceId}-question-description`;
  const selectionHintId = `${instanceId}-selection-hint`;
  const isMultiple = currentQuestion.type === 'multiple';
  const answeredCount = Object.values(responses).filter(
    (response) => !response.skipped && response.optionIds.length > 0,
  ).length;
  const checkpointIndex = [4, 8, 12, questions.length].indexOf(answeredCount);
  const checkpoint = checkpointIndex >= 0 ? copy.checkpoints[checkpointIndex] : null;
  const reaction =
    selectedOptionIds.length > 0 ? copy.reactions[currentIndex % copy.reactions.length] : null;
  const categoryLabel = copy.category[currentQuestion.category] ?? currentQuestion.category;
  const continueAfterConfirmation = () => {
    if (!canContinue || confirming) return;
    setConfirming(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
    confirmationTimerRef.current = window.setTimeout(() => {
      setConfirming(false);
      continueQuestionnaire();
    }, delay);
  };

  return (
    <section aria-labelledby={questionTitleId} className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <Stack className={styles.progressBlock} gap="sm">
            <Stack align="center" direction="row" justify="between">
              <Typography as="span" className={styles.stepLabel} variant="caption">
                {copy.progress(currentIndex + 1, questions.length)}
              </Typography>
              <Typography as="span" variant="caption">
                {currentQuestion.required ? copy.required : copy.optional}
              </Typography>
            </Stack>
            <PortraitProgress
              currentLabel={copy.building(categoryLabel)}
              label={copy.progress(currentIndex + 1, questions.length)}
              remainingLabel={copy.remaining(Math.max(0, questions.length - answeredCount))}
              total={questions.length}
              value={answeredCount}
            />
          </Stack>

          {checkpoint ? (
            <div aria-label={copy.checkpointAria} className={styles.checkpoint} role="note">
              <span aria-hidden="true" className={styles.checkpointMark} />
              <Typography>{checkpoint}</Typography>
            </div>
          ) : null}

          <Card
            className={styles.questionCard}
            data-confirming={confirming || undefined}
            key={currentQuestion.id}
          >
            <Stack gap="lg">
              <QuestionScene
                active={selectedOptionIds.length > 0}
                category={currentQuestion.category}
                questionId={currentQuestion.id}
              />
              <Stack gap="sm">
                <Typography
                  as="h1"
                  className={styles.questionTitle}
                  id={questionTitleId}
                  tabIndex={-1}
                  variant="flow-title"
                >
                  {currentQuestion.title}
                </Typography>
                {currentQuestion.description ? (
                  <Typography className={styles.questionDescription} id={questionDescriptionId}>
                    {currentQuestion.description}
                  </Typography>
                ) : null}
              </Stack>

              <fieldset
                aria-describedby={
                  currentQuestion.description
                    ? `${questionDescriptionId} ${selectionHintId}`
                    : selectionHintId
                }
                className={styles.optionGroup}
                data-presentation={currentQuestion.presentation}
              >
                <legend className={styles.visuallyHidden}>
                  {copy.optionsLegend(currentQuestion.title)}
                </legend>
                {currentQuestion.options.map((option) => (
                  <QuestionOptionCard
                    checked={selectedOptionIds.includes(option.id)}
                    key={option.id}
                    name={currentQuestion.id}
                    onChange={selectOption}
                    option={option}
                    order={
                      currentQuestion.presentation === 'ranked'
                        ? selectedOptionIds.indexOf(option.id) + 1 || undefined
                        : undefined
                    }
                    presentation={currentQuestion.presentation}
                    type={currentQuestion.type}
                  />
                ))}
              </fieldset>

              <Typography
                aria-live="polite"
                className={styles.selectionHint}
                id={selectionHintId}
                variant="caption"
              >
                {confirming
                  ? copy.confirming
                  : (reaction ??
                    (selectedOptionIds.length > 0 && isMultiple
                      ? copy.selected(selectedOptionIds.length)
                      : isMultiple
                        ? copy.selectMultiple
                        : copy.selectOne))}
              </Typography>

              <div className={styles.actions}>
                <Button disabled={isFirstQuestion} onClick={previousQuestion}>
                  {copy.back}
                </Button>
                <div className={styles.forwardActions}>
                  {currentQuestion.allowSkip && !currentQuestion.required ? (
                    <Button onClick={skipQuestion}>{copy.skip}</Button>
                  ) : null}
                  <Button
                    aria-describedby={selectionHintId}
                    disabled={!canContinue || confirming}
                    onClick={continueAfterConfirmation}
                    prominence="primary"
                    size="large"
                  >
                    {copy.continue}
                  </Button>
                </div>
              </div>
            </Stack>
          </Card>
        </div>
      </Container>
    </section>
  );
}
