import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Input, Stack, Surface, Typography } from '@shared/ui';
import { useDraftPortraitState } from '@store';

import { createNumerologyProfile, isValidNumerologyDate } from '@features/numerology';

import {
  deckThemes,
  standardTarotDeck,
  tarotCardById,
  tarotContextQuestions,
  tarotCopy,
  tarotSpreadById,
} from '../data';
import { useTarotSession } from '../hooks';
import {
  createAutomaticSelections,
  createManualCandidates,
  createManualSelections,
  createTarotReading,
} from '../lib';
import type { TarotCardSelection } from '../types';
import { TarotCardView } from '../components/TarotCardView';
import { TarotCardBack } from '../components/TarotCardBack';
import {
  isManualCardSelectionComplete,
  toggleManualCardSelection,
} from '../components/manual-selection-state';
import styles from '../components/Tarot.module.css';
import {
  createRevealState,
  getRevealCta,
  getRevealTimerPlan,
  isCurrentCardVisible,
  isPositionFaceUp,
  isRevealActive,
  revealReducer,
  scheduleRevealTransition,
} from './reveal-state-machine';

type Step = 'cards' | 'context' | 'date' | 'mode' | 'numerology' | 'reveal' | 'theme';
const steps: readonly Step[] = [
  'context',
  'date',
  'numerology',
  'theme',
  'mode',
  'cards',
  'reveal',
];

export function TarotReadingFlow({
  locale,
  onBack,
  onComplete,
}: {
  locale: Locale;
  onBack: () => void;
  onComplete: (reading: ReturnType<typeof createTarotReading>) => void;
}) {
  const { actions, state } = useTarotSession();
  const { draft } = useDraftPortraitState();
  const copy = tarotCopy[locale];
  const spread = tarotSpreadById.get(state.spreadId) ?? tarotSpreadById.get('day')!;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(state.answers);
  const [date, setDate] = useState(state.birthDate);
  const [manualIds, setManualIds] = useState<readonly string[]>([]);
  const [revealState, dispatchReveal] = useReducer(
    revealReducer,
    state.selections.length || spread.positions.length,
    createRevealState,
  );
  const [error, setError] = useState('');
  const revealHeadingRef = useRef<HTMLDivElement>(null);
  const previousRevealIndexRef = useRef(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const step = steps[stepIndex]!;
  const stepTitle =
    step === 'context'
      ? copy.contextTitle
      : step === 'date'
        ? copy.dateTitle
        : step === 'numerology'
          ? copy.numerologyTitle
          : step === 'theme'
            ? copy.chooseTheme
            : step === 'mode'
              ? copy.chooseMode
              : step === 'cards'
                ? state.selectionMode === 'manual'
                  ? copy.chooseCards
                  : copy.deal
                : copy.revealTitle;
  const numerology = useMemo(
    () => (isValidNumerologyDate(date) ? createNumerologyProfile(date, locale) : null),
    [date, locale],
  );
  const candidates = useMemo(
    () => createManualCandidates(standardTarotDeck.cards, spread, state.seed),
    [spread, state.seed],
  );
  const selections = useMemo<readonly TarotCardSelection[]>(() => {
    if (step === 'reveal' && state.selections.length) return state.selections;
    return state.selectionMode === 'automatic'
      ? createAutomaticSelections(standardTarotDeck.cards, spread, state.seed)
      : createManualSelections(manualIds, spread, state.seed);
  }, [manualIds, spread, state.seed, state.selectionMode, state.selections, step]);

  useEffect(() => {
    const plan = getRevealTimerPlan(revealState);
    if (!plan) return undefined;
    return scheduleRevealTransition<number>(plan, dispatchReveal, {
      clear: (timer) => window.clearTimeout(timer),
      set: (callback, delay) => window.setTimeout(callback, delay),
    });
  }, [revealState]);

  useEffect(() => {
    if (prefersReducedMotion && isRevealActive(revealState)) {
      dispatchReveal({ type: 'reduced-motion' });
    }
  }, [prefersReducedMotion, revealState]);

  useEffect(() => {
    if (step !== 'reveal' || revealState.currentIndex === previousRevealIndexRef.current) return;
    previousRevealIndexRef.current = revealState.currentIndex;
    const frame = window.requestAnimationFrame(() => revealHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [revealState.currentIndex, step]);

  function previous() {
    if (stepIndex === 0) onBack();
    else setStepIndex((value) => value - 1);
  }
  function next() {
    if (step === 'context') {
      if (answers.length !== tarotContextQuestions.length) return;
      actions.saveAnswers(answers);
    }
    if (step === 'date') {
      if (!isValidNumerologyDate(date)) {
        setError(copy.invalidDate);
        return;
      }
      actions.saveBirthDate(date);
      setError('');
    }
    if (step === 'cards') {
      if (
        state.selectionMode === 'manual' &&
        !isManualCardSelectionComplete(manualIds, spread.positions.length)
      )
        return;
      actions.saveSelections(selections);
    }
    if (step === 'reveal') {
      if (!numerology) return;
      const context = {
        birthDate: date,
        deckTheme: state.deckTheme,
        interests: draft.interests,
        locale,
        numerology,
        period: spread.period,
        psychologyAnswers: answers,
        seed: state.seed,
        selectionMode: state.selectionMode,
        spreadId: spread.id,
        topic: spread.topic,
      };
      const reading = createTarotReading(context, selections);
      actions.saveReading(reading);
      onComplete(reading);
      return;
    }
    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  }

  function handleRevealAction() {
    if (revealState.sequence === 'waiting') {
      dispatchReveal({ reducedMotion: prefersReducedMotion, type: 'start' });
      return;
    }
    if (revealState.sequence === 'all-complete') {
      next();
      return;
    }
    if (revealState.sequence === 'waiting-for-next') {
      dispatchReveal({ reducedMotion: prefersReducedMotion, type: 'next-card' });
    }
  }
  const canContinue =
    step === 'context'
      ? answers.length === tarotContextQuestions.length
      : step === 'date'
        ? isValidNumerologyDate(date)
        : step === 'cards'
          ? state.selectionMode === 'automatic' ||
            isManualCardSelectionComplete(manualIds, spread.positions.length)
          : step === 'reveal'
            ? revealState.sequence === 'all-complete'
            : true;
  const currentSelection = selections[revealState.currentIndex];
  const currentCard = tarotCardById.get(currentSelection?.cardId ?? '');
  const currentPosition = spread.positions[revealState.currentIndex]?.label[locale];
  const currentCardVisible = isCurrentCardVisible(revealState);
  const revealCta = getRevealCta(revealState);
  const activeCardAnnouncement = currentCardVisible
    ? `${copy.position} ${revealState.currentIndex + 1} / ${selections.length}. ${
        currentCard?.name[locale] ?? ''
      }. ${currentSelection?.orientation === 'reversed' ? copy.reversed : copy.upright}.`
    : `${copy.position} ${revealState.currentIndex + 1} / ${selections.length}. ${
        currentPosition ?? ''
      }. ${copy.cardBack}.`;
  return (
    <div className={styles.flowPage} data-reading-step={step}>
      <Container size="wide">
        <div className={styles.flowHeader}>
          <div>
            <Badge tone="warning">{spread.title[locale]}</Badge>
            <p className={styles.flowLocation}>
              <span aria-current="step">{stepTitle}</span>
              <small>
                {copy.step} {stepIndex + 1} / {steps.length}
              </small>
            </p>
          </div>
          <div aria-hidden="true" className={styles.flowNodes}>
            {steps.map((item, index) => (
              <i data-complete={index <= stepIndex || undefined} key={item} />
            ))}
          </div>
        </div>
        <Surface className={styles.flowSurface} data-reading-step={step} elevation="low">
          {step === 'context' ? (
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {copy.contextTitle}
              </Typography>
              <Typography>{copy.contextLead}</Typography>
              <div className={styles.questionList}>
                {tarotContextQuestions.map((question) => (
                  <fieldset className={styles.question} key={question.id}>
                    <legend>{question.title[locale]}</legend>
                    <div className={styles.optionGrid}>
                      {question.options.map((option) => {
                        const checked = answers.some(
                          (answer) =>
                            answer.questionId === question.id && answer.optionId === option.id,
                        );
                        return (
                          <label data-selected={checked || undefined} key={option.id}>
                            <input
                              checked={checked}
                              name={question.id}
                              onChange={() =>
                                setAnswers((current) => [
                                  ...current.filter((answer) => answer.questionId !== question.id),
                                  { optionId: option.id, questionId: question.id },
                                ])
                              }
                              type="radio"
                            />
                            <span>{option.label[locale]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </Stack>
          ) : null}
          {step === 'date' ? (
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {copy.dateTitle}
              </Typography>
              <Typography>{copy.dateLead}</Typography>
              <label className={styles.dateField}>
                <span>{copy.birthDate}</span>
                <Input
                  aria-describedby={error ? 'tarot-date-error' : undefined}
                  aria-invalid={Boolean(error)}
                  autoComplete="bday"
                  max={new Date().toISOString().slice(0, 10)}
                  onBlur={() =>
                    setError(date && !isValidNumerologyDate(date) ? copy.invalidDate : '')
                  }
                  onChange={(event) => setDate(event.target.value)}
                  type="date"
                  value={date}
                />
              </label>
              {error ? (
                <Typography className={styles.error} id="tarot-date-error" role="alert">
                  {error}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {step === 'numerology' && numerology ? (
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {copy.numerologyTitle}
              </Typography>
              <Typography>{copy.numerologyLead}</Typography>
              <div className={styles.contextNumbers}>
                <span>
                  <b>{numerology.lifePath.value}</b>
                  {copy.lifePath}
                </span>
                <span>
                  <b>{numerology.personalYear.value}</b>
                  {copy.personalYear}
                </span>
                <span>
                  <b>{numerology.zodiac.sign.slice(0, 1)}</b>
                  {numerology.zodiac.sign}
                </span>
              </div>
            </Stack>
          ) : null}
          {step === 'theme' ? (
            <div className={styles.themeExperience}>
              <Stack align="start" gap="lg">
                <Typography as="h1" variant="heading-lg">
                  {copy.chooseTheme}
                </Typography>
                <Typography>{copy.themeLead}</Typography>
                <div aria-live="polite" className={styles.activeThemeCopy}>
                  <strong>
                    {deckThemes.find((theme) => theme.id === state.deckTheme)?.name[locale]}
                  </strong>
                  <Typography>
                    {deckThemes.find((theme) => theme.id === state.deckTheme)?.description[locale]}
                  </Typography>
                </div>
              </Stack>
              <div aria-hidden="true" className={styles.themePreview} data-theme={state.deckTheme}>
                <span className={styles.previewCard}>
                  <TarotCardBack theme={state.deckTheme} />
                </span>
                <span className={styles.previewCard}>
                  <TarotCardBack theme={state.deckTheme} />
                </span>
                <span className={styles.previewCard}>
                  <TarotCardBack theme={state.deckTheme} />
                </span>
              </div>
              <fieldset className={styles.themeFieldset}>
                <legend className={styles.srOnly}>{copy.chooseTheme}</legend>
                <div className={styles.themeGrid}>
                  {deckThemes.map((theme) => (
                    <label className={styles.themeChoice} data-theme={theme.id} key={theme.id}>
                      <input
                        checked={state.deckTheme === theme.id}
                        name="tarot-theme"
                        onChange={() => actions.setDeckTheme(theme.id)}
                        type="radio"
                      />
                      <span aria-hidden="true" className={styles.themePattern}>
                        <TarotCardBack theme={theme.id} />
                      </span>
                      <span className={styles.themeChoiceCopy}>
                        <strong>{theme.name[locale]}</strong>
                        <small>{theme.description[locale]}</small>
                      </span>
                      <span aria-hidden="true" className={styles.themeSelectionMark}>
                        ✓
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}
          {step === 'mode' ? (
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {copy.chooseMode}
              </Typography>
              <div className={styles.modeGrid}>
                <Button
                  aria-pressed={state.selectionMode === 'automatic'}
                  onClick={() => actions.setSelectionMode('automatic')}
                  prominence="quiet"
                >
                  <strong>{copy.automatic}</strong>
                  <span>{copy.automaticNote}</span>
                </Button>
                <Button
                  aria-pressed={state.selectionMode === 'manual'}
                  onClick={() => actions.setSelectionMode('manual')}
                  prominence="quiet"
                >
                  <strong>{copy.manual}</strong>
                  <span>{copy.manualNote}</span>
                </Button>
              </div>
            </Stack>
          ) : null}
          {step === 'cards' ? (
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {state.selectionMode === 'manual' ? copy.chooseCards : copy.deal}
              </Typography>
              <Typography aria-atomic="true" aria-live="polite">
                {state.selectionMode === 'manual'
                  ? copy.selectedCount
                      .replace('{current}', String(manualIds.length))
                      .replace('{total}', String(spread.positions.length))
                  : copy.sessionFixed}
              </Typography>
              <div
                className={state.selectionMode === 'manual' ? styles.cardFan : styles.deckShowcase}
                data-count={
                  state.selectionMode === 'manual' ? candidates.length : selections.length
                }
                data-selection-mode={state.selectionMode}
              >
                {state.selectionMode === 'manual'
                  ? candidates.map((card, index) => (
                      <TarotCardView
                        ariaDisabled={
                          manualIds.length >= spread.positions.length &&
                          !manualIds.includes(card.id)
                        }
                        index={index}
                        instantReveal={revealState.instant && index === revealState.currentIndex}
                        isSelected={manualIds.includes(card.id)}
                        key={card.id}
                        locale={locale}
                        onClick={() =>
                          setManualIds((current) =>
                            toggleManualCardSelection(current, card.id, spread.positions.length),
                          )
                        }
                        selectionOrder={manualIds.indexOf(card.id) + 1 || undefined}
                        theme={state.deckTheme}
                        total={candidates.length}
                        variant="selectable"
                      />
                    ))
                  : selections.map((selection, index) => (
                      <TarotCardView
                        index={index}
                        key={selection.cardId}
                        locale={locale}
                        position={spread.positions[index]?.label[locale]}
                        selection={selection}
                        theme={state.deckTheme}
                        total={selections.length}
                        variant="assigned"
                      />
                    ))}
              </div>
              {state.selectionMode === 'automatic' ? (
                <Button
                  disabled={state.reshuffled}
                  onClick={() => actions.reshuffleOnce()}
                  prominence="secondary"
                >
                  {state.reshuffled ? copy.reshuffled : copy.reshuffle}
                </Button>
              ) : null}
            </Stack>
          ) : null}
          {step === 'reveal' ? (
            <Stack className={styles.revealFlow} gap="lg">
              <div className={styles.revealIntro}>
                <Typography as="h1" variant="heading-lg">
                  {copy.revealTitle}
                </Typography>
                <Typography>{copy.revealLead}</Typography>
              </div>
              <div
                className={styles.revealExperience}
                data-phase={revealState.card}
                data-sequence={revealState.sequence}
              >
                <div
                  aria-label={copy.revealTitle}
                  className={styles.revealSequence}
                  data-count={selections.length}
                  role="group"
                >
                  {selections.map((selection, index) => {
                    const positionState = revealState.positions[index] ?? 'locked';
                    return (
                      <TarotCardView
                        index={index}
                        isRevealed={isPositionFaceUp(revealState, index)}
                        isSelected={index === revealState.currentIndex}
                        key={selection.cardId}
                        locale={locale}
                        position={spread.positions[index]?.label[locale]}
                        preloadFace={positionState === 'ready'}
                        revealPhase={
                          index === revealState.currentIndex ? revealState.card : undefined
                        }
                        revealStatus={positionState}
                        selection={selection}
                        theme={state.deckTheme}
                        total={selections.length}
                        variant="compact"
                      />
                    );
                  })}
                </div>
                <div className={styles.revealStage}>
                  <span aria-hidden="true" className={styles.revealLight} />
                  <TarotCardView
                    ariaLabel={activeCardAnnouncement}
                    instantReveal={revealState.instant}
                    isRevealed={currentCardVisible}
                    locale={locale}
                    position={currentPosition}
                    revealPhase={revealState.card}
                    revealStatus={revealState.positions[revealState.currentIndex]}
                    selection={currentSelection}
                    showPosition={false}
                    theme={state.deckTheme}
                    variant="revealing"
                  />
                  <div className={styles.revealDetails}>
                    <div className={styles.revealProgress} ref={revealHeadingRef} tabIndex={-1}>
                      <span>
                        {copy.position} {Math.min(revealState.currentIndex + 1, selections.length)}{' '}
                        / {selections.length}
                      </span>
                      <strong>{currentPosition}</strong>
                    </div>
                    {isRevealActive(revealState) && !prefersReducedMotion ? (
                      <Button
                        className={styles.skipReveal}
                        onClick={() => dispatchReveal({ type: 'skip' })}
                        prominence="quiet"
                      >
                        {copy.skipAnimation}
                      </Button>
                    ) : null}
                    <div aria-live="polite" className={styles.revealInterpretation}>
                      {currentCardVisible && !isRevealActive(revealState) ? (
                        <>
                          <Typography as="h2" variant="heading-md">
                            {currentCard?.name[locale]}
                          </Typography>
                          <span className={styles.revealOrientation}>
                            {currentSelection?.orientation === 'reversed'
                              ? copy.reversed
                              : copy.upright}
                          </span>
                          <Typography>
                            {currentSelection?.orientation === 'reversed'
                              ? currentCard?.reversed[locale]
                              : currentCard?.upright[locale]}
                          </Typography>
                        </>
                      ) : null}
                    </div>
                    {revealCta ? (
                      <Button
                        className={styles.revealCta}
                        onClick={handleRevealAction}
                        prominence="primary"
                        size="large"
                      >
                        {revealCta === 'open'
                          ? copy.openCard
                          : revealCta === 'finish'
                            ? copy.seeReading
                            : copy.openNext}{' '}
                        <span aria-hidden="true">→</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Stack>
          ) : null}
          <div className={styles.flowActions} data-reveal={step === 'reveal' || undefined}>
            <Button onClick={previous} prominence="quiet">
              {copy.back}
            </Button>
            {step !== 'reveal' ? (
              <Button disabled={!canContinue} onClick={next} prominence="primary" size="large">
                {copy.continue}
              </Button>
            ) : null}
          </div>
        </Surface>
      </Container>
    </div>
  );
}
