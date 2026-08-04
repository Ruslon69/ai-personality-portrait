import { useEffect, useMemo, useState } from 'react';

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
import styles from '../components/Tarot.module.css';

type Step = 'cards' | 'context' | 'date' | 'mode' | 'numerology' | 'reveal' | 'theme';
type RevealPhase = 'flip' | 'light' | 'pause' | 'rest' | 'settled';
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
  const [revealedCount, setRevealedCount] = useState(0);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('rest');
  const [error, setError] = useState('');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const step = steps[stepIndex]!;
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
    if (revealPhase !== 'pause') return undefined;
    if (prefersReducedMotion) return undefined;
    const timers = [
      window.setTimeout(() => setRevealPhase('flip'), 180),
      window.setTimeout(() => setRevealPhase('light'), 760),
      window.setTimeout(() => setRevealPhase('settled'), 1040),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [prefersReducedMotion, revealPhase]);

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
      if (state.selectionMode === 'manual' && manualIds.length !== spread.positions.length) return;
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
    if (revealPhase === 'rest') {
      setRevealPhase(prefersReducedMotion ? 'settled' : 'pause');
      return;
    }
    if (revealPhase !== 'settled') return;
    if (revealedCount === selections.length - 1) {
      next();
      return;
    }
    setRevealedCount((count) => count + 1);
    setRevealPhase(prefersReducedMotion ? 'settled' : 'pause');
  }
  const canContinue =
    step === 'context'
      ? answers.length === tarotContextQuestions.length
      : step === 'date'
        ? isValidNumerologyDate(date)
        : step === 'cards'
          ? state.selectionMode === 'automatic' || manualIds.length === spread.positions.length
          : step === 'reveal'
            ? revealedCount === selections.length
            : true;
  return (
    <div className={styles.flowPage}>
      <Container size="wide">
        <div className={styles.flowHeader}>
          <div>
            <Badge tone="warning">{spread.title[locale]}</Badge>
            <Typography as="p" variant="caption">
              {copy.step} {stepIndex + 1} / {steps.length}
            </Typography>
          </div>
          <div aria-hidden="true" className={styles.flowNodes}>
            {steps.map((item, index) => (
              <i data-complete={index <= stepIndex || undefined} key={item} />
            ))}
          </div>
        </div>
        <Surface className={styles.flowSurface} elevation="low">
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
                  <i />
                  <b />
                </span>
                <span className={styles.previewCard}>
                  <i />
                  <b />
                </span>
                <span className={styles.previewCard}>
                  <i />
                  <b />
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
                        <i />
                        <b />
                      </span>
                      <span>
                        <strong>{theme.name[locale]}</strong>
                        <small>{theme.description[locale]}</small>
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
              >
                {state.selectionMode === 'manual'
                  ? candidates.map((card, index) => (
                      <TarotCardView
                        ariaDisabled={
                          manualIds.length >= spread.positions.length &&
                          !manualIds.includes(card.id)
                        }
                        index={index}
                        isSelected={manualIds.includes(card.id)}
                        key={card.id}
                        locale={locale}
                        onClick={() =>
                          setManualIds((current) =>
                            current.includes(card.id)
                              ? current.filter((id) => id !== card.id)
                              : current.length < spread.positions.length
                                ? [...current, card.id]
                                : current,
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
            <Stack gap="lg">
              <Typography as="h1" variant="heading-lg">
                {copy.revealTitle}
              </Typography>
              <Typography>{copy.revealLead}</Typography>
              <div className={styles.revealExperience} data-phase={revealPhase}>
                <div aria-label={copy.revealTitle} className={styles.revealSequence} role="group">
                  {selections.map((selection, index) => (
                    <TarotCardView
                      index={index}
                      isRevealed={index < revealedCount}
                      isSelected={index === revealedCount}
                      key={selection.cardId}
                      locale={locale}
                      position={spread.positions[index]?.label[locale]}
                      selection={selection}
                      theme={state.deckTheme}
                      total={selections.length}
                      variant="compact"
                    />
                  ))}
                </div>
                <div className={styles.revealStage}>
                  <div className={styles.revealProgress}>
                    <span>
                      {copy.position} {Math.min(revealedCount + 1, selections.length)} /{' '}
                      {selections.length}
                    </span>
                    <strong>{spread.positions[revealedCount]?.label[locale]}</strong>
                  </div>
                  <span aria-hidden="true" className={styles.revealLight} />
                  <TarotCardView
                    ariaDisabled={
                      revealPhase === 'pause' || revealPhase === 'flip' || revealPhase === 'light'
                    }
                    isRevealed={
                      revealPhase === 'flip' || revealPhase === 'light' || revealPhase === 'settled'
                    }
                    locale={locale}
                    onClick={handleRevealAction}
                    position={spread.positions[revealedCount]?.label[locale]}
                    selection={selections[revealedCount]}
                    showPosition={false}
                    theme={state.deckTheme}
                    variant="revealing"
                  />
                  <div aria-live="polite" className={styles.revealInterpretation}>
                    {revealPhase === 'settled' ? (
                      <>
                        <Typography as="h2" variant="heading-md">
                          {tarotCardById.get(selections[revealedCount]?.cardId ?? '')?.name[locale]}
                        </Typography>
                        <Typography>
                          {selections[revealedCount]?.orientation === 'reversed'
                            ? tarotCardById.get(selections[revealedCount]?.cardId ?? '')?.reversed[
                                locale
                              ]
                            : tarotCardById.get(selections[revealedCount]?.cardId ?? '')?.upright[
                                locale
                              ]}
                        </Typography>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </Stack>
          ) : null}
          <div className={styles.flowActions}>
            <Button onClick={previous} prominence="quiet">
              {copy.back}
            </Button>
            <Button
              disabled={
                step === 'reveal'
                  ? revealPhase === 'pause' || revealPhase === 'flip' || revealPhase === 'light'
                  : !canContinue
              }
              onClick={step === 'reveal' ? handleRevealAction : next}
              prominence="primary"
              size="large"
            >
              {step === 'reveal'
                ? revealPhase === 'rest'
                  ? copy.openCard
                  : revealPhase === 'settled' && revealedCount === selections.length - 1
                    ? copy.seeReading
                    : copy.openNext
                : copy.continue}
            </Button>
          </div>
        </Surface>
      </Container>
    </div>
  );
}
