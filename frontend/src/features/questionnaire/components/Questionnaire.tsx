import { useEffect, useId, useRef } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Button, Card, Container, Progress, Stack, Typography } from '@shared/ui';

import { useQuestionnaire } from '../hooks';
import type { QuestionnaireQuestion, QuestionnaireResponses } from '../types';
import { QuestionOptionCard } from './QuestionOptionCard';
import styles from './Questionnaire.module.css';

type QuestionnaireProps = {
  initialResponses?: QuestionnaireResponses;
  onComplete: (responses: QuestionnaireResponses) => void;
  onResponsesChange?: (responses: QuestionnaireResponses) => void;
  questions: readonly QuestionnaireQuestion[];
};

export function Questionnaire({
  initialResponses,
  onComplete,
  onResponsesChange,
  questions,
}: QuestionnaireProps) {
  const {
    canContinue,
    continueQuestionnaire,
    currentIndex,
    currentQuestion,
    currentResponse,
    isFirstQuestion,
    previousQuestion,
    progressValue,
    selectOption,
    skipQuestion,
  } = useQuestionnaire({
    initialResponses,
    onComplete,
    onResponsesChange,
    questions,
  });
  const previousQuestionIdRef = useRef(currentQuestion?.id);
  const instanceId = useId();
  const questionTitleId = `${instanceId}-question-title`;

  useEffect(() => {
    if (!currentQuestion || previousQuestionIdRef.current === currentQuestion.id) {
      return;
    }

    previousQuestionIdRef.current = currentQuestion.id;
    return focusElementByIdOnNextFrame(questionTitleId);
  }, [currentQuestion, questionTitleId]);

  if (!currentQuestion) {
    return null;
  }

  const selectedOptionIds = currentResponse?.optionIds ?? [];
  const questionDescriptionId = `${instanceId}-question-description`;
  const selectionHintId = `${instanceId}-selection-hint`;
  const isMultiple = currentQuestion.type === 'multiple';

  return (
    <section aria-labelledby={questionTitleId} className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <Stack className={styles.progressBlock} gap="sm">
            <Stack align="center" direction="row" justify="between">
              <Typography as="span" className={styles.stepLabel} variant="caption">
                Шаг {currentIndex + 1} из {questions.length}
              </Typography>
              <Typography as="span" variant="caption">
                {currentQuestion.required ? 'Обязательный вопрос' : 'Можно пропустить'}
              </Typography>
            </Stack>
            <Progress
              aria-label={`Текущий вопрос: ${currentIndex + 1} из ${questions.length}`}
              max={questions.length}
              value={progressValue}
            />
          </Stack>

          <Card className={styles.questionCard} key={currentQuestion.id}>
            <Stack gap="lg">
              <Stack gap="sm">
                <Typography
                  as="h1"
                  className={styles.questionTitle}
                  id={questionTitleId}
                  tabIndex={-1}
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
              >
                <legend className={styles.visuallyHidden}>
                  Варианты ответа на вопрос: {currentQuestion.title}
                </legend>
                {currentQuestion.options.map((option) => (
                  <QuestionOptionCard
                    checked={selectedOptionIds.includes(option.id)}
                    key={option.id}
                    name={currentQuestion.id}
                    onChange={selectOption}
                    option={option}
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
                {selectedOptionIds.length > 0
                  ? isMultiple
                    ? `Выбрано вариантов: ${selectedOptionIds.length}`
                    : 'Ответ выбран'
                  : isMultiple
                    ? 'Выберите один или несколько вариантов'
                    : 'Выберите один вариант'}
              </Typography>

              <div className={styles.actions}>
                <Button disabled={isFirstQuestion} onClick={previousQuestion}>
                  Назад
                </Button>
                <div className={styles.forwardActions}>
                  {currentQuestion.allowSkip && !currentQuestion.required ? (
                    <Button onClick={skipQuestion}>Пропустить</Button>
                  ) : null}
                  <Button
                    aria-describedby={selectionHintId}
                    className={styles.primaryButton}
                    disabled={!canContinue}
                    onClick={continueQuestionnaire}
                  >
                    Продолжить
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
