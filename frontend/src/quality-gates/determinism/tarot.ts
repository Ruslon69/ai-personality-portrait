import { createNumerologyProfile } from '../../features/numerology/lib/numerology-engine';
import { RWS_CLASSIC_DECK_ID, getTarotArtwork, tarotArtworkManifest } from '../../assets/tarot';
import {
  isManualCardSelectionComplete,
  toggleManualCardSelection,
} from '../../features/tarot/components/manual-selection-state';
import { deckThemes, standardTarotDeck, tarotSpreads } from '../../features/tarot/data';
import {
  createAutomaticSelections,
  createManualSelections,
} from '../../features/tarot/lib/selection-engine';
import {
  createActiveCardInterpretation,
  interpretationWordCount,
  russianCardName,
} from '../../features/tarot/lib/interpretation-copy';
import { createTarotReading } from '../../features/tarot/lib/reading-engine';
import { russianTarotInterpretationProfiles } from '../../features/tarot/lib/russian-interpretation-profiles';
import type { TarotCard, TarotReadingContext } from '../../features/tarot/types';
import { QualityAssertions } from '../assertions';
import { negativeQualityFixtures } from '../fixtures/negative-fixtures';
import { QUALITY_BASELINE } from '../fixtures/baseline';

const locales = QUALITY_BASELINE.locales;
const timestamp = '2026-08-05T12:00:00.000Z';

export function validateTarotCardIds(cards: readonly Pick<TarotCard, 'id'>[]) {
  const ids = cards.map((card) => card.id);
  return { duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index) };
}

function semanticReading(reading: ReturnType<typeof createTarotReading>) {
  return {
    expertContent: reading.expertInterpretation.content,
    expertSections: reading.expertInterpretation.sections,
    headline: reading.headline,
    interpretations: reading.interpretations,
    practicalFocus: reading.practicalFocus,
    selections: reading.selections,
    summary: reading.summary,
  };
}

export function runTarotRegressionGate() {
  const assertions = new QualityAssertions();
  const cards = standardTarotDeck.cards;
  assertions.assert(cards.length === QUALITY_BASELINE.tarotCardCount, {
    actual: cards.length,
    code: 'tarot-card-count',
    expected: QUALITY_BASELINE.tarotCardCount,
    message: 'The standard deck must contain exactly 78 cards.',
  });
  assertions.assert(cards.filter((card) => card.arcana === 'major').length === 22, {
    code: 'major-arcana-count',
    message: 'The deck must contain exactly 22 Major Arcana cards.',
  });
  assertions.assert(cards.filter((card) => card.arcana === 'minor').length === 56, {
    code: 'minor-arcana-count',
    message: 'The deck must contain exactly 56 Minor Arcana cards.',
  });
  (['wands', 'cups', 'swords', 'pentacles'] as const).forEach((suit) =>
    assertions.assert(cards.filter((card) => card.suit === suit).length === 14, {
      code: `tarot-suit-count-${suit}`,
      message: `${suit} must contain exactly 14 cards.`,
    }),
  );
  assertions.assert(validateTarotCardIds(cards).duplicateIds.length === 0, {
    code: 'duplicate-tarot-card-id',
    message: 'Tarot card IDs must be unique.',
  });
  assertions.assert(
    cards.every(
      (card) =>
        tarotArtworkManifest.get(card.id)?.rightsStatus === 'verified-public-domain' &&
        tarotArtworkManifest.get(card.id)?.deckId === RWS_CLASSIC_DECK_ID,
    ),
    {
      code: 'tarot-artwork-rws-coverage',
      message: 'Every Tarot card must have a verified classic RWS artwork entry.',
    },
  );
  assertions.assert(
    JSON.stringify(deckThemes.map((theme) => theme.id)) ===
      JSON.stringify(['cosmic-minimal', 'solar-lines', 'midnight-geometry', 'deep-water']),
    {
      code: 'tarot-card-back-coverage',
      message: 'Classic, Royal, Midnight and Obsidian backs must remain available.',
    },
  );
  cards.forEach((card) => {
    locales.forEach((locale) => {
      const strings = [
        card.advice[locale],
        card.caution[locale],
        card.light[locale],
        card.money[locale],
        card.name[locale],
        card.personalGrowth[locale],
        card.relationship[locale],
        card.reversed[locale],
        card.shadow[locale],
        card.upright[locale],
        card.work[locale],
      ];
      assertions.assert(
        strings.every((value) => value.trim().length > 0) &&
          card.baseThemes[locale].length > 0 &&
          card.keywords[locale].length > 0,
        {
          code: 'tarot-card-localization',
          message: `${card.id} is missing required ${locale} semantic content.`,
        },
      );
    });
  });
  assertions.assert(
    cards.every((card) => Boolean(russianTarotInterpretationProfiles[card.id])),
    {
      code: 'tarot-russian-card-specific-coverage',
      message: 'Every Tarot card must have a card-specific Russian interpretation profile.',
    },
  );
  assertions.assert(tarotSpreads.length === QUALITY_BASELINE.spreadCount, {
    actual: tarotSpreads.length,
    code: 'tarot-spread-count',
    expected: QUALITY_BASELINE.spreadCount,
    message: 'Tarot spread count differs from the approved baseline.',
  });
  tarotSpreads.forEach((spread) => {
    const positionIds = spread.positions.map((position) => position.id);
    assertions.assert(positionIds.length > 0 && new Set(positionIds).size === positionIds.length, {
      code: 'invalid-spread-positions',
      message: `${spread.id} has empty or duplicate position IDs.`,
    });
    locales.forEach((locale) =>
      assertions.assert(
        Boolean(spread.title[locale].trim()) &&
          Boolean(spread.description[locale].trim()) &&
          spread.positions.every(
            (position) =>
              Boolean(position.label[locale].trim()) && Boolean(position.prompt[locale].trim()),
          ),
        {
          code: 'spread-localization',
          message: `${spread.id} is incomplete for ${locale}.`,
        },
      ),
    );
    const selections = createAutomaticSelections(cards, spread, 'quality-seed');
    assertions.assert(
      selections.every((selection, index) => selection.positionId === positionIds[index]),
      {
        code: 'spread-selection-position-reference',
        message: `${spread.id} selections do not reference their declared positions.`,
      },
    );
  });

  const spread = tarotSpreads.find((item) => item.id === 'week');
  if (!spread) throw new Error('Week spread is required for Tarot regression gates.');
  const automatic = createAutomaticSelections(cards, spread, 'quality-seed');
  assertions.assert(
    JSON.stringify(automatic) ===
      JSON.stringify(createAutomaticSelections(cards, spread, 'quality-seed')),
    {
      code: 'seeded-selection-nondeterministic',
      message: 'Identical seed and spread did not produce identical selections.',
    },
  );
  const manualIds = automatic.map((selection) => selection.cardId).reverse();
  const manual = createManualSelections(manualIds, spread, 'manual-quality-seed');
  assertions.assert(
    manual.every((selection, index) => selection.cardId === manualIds[index]),
    {
      code: 'manual-selection-order',
      message: 'Manual selection did not preserve the chosen card order.',
    },
  );
  ([1, 3, 5, 6] as const).forEach((requiredCount) => {
    const candidateIds = cards.slice(0, requiredCount + 1).map((card) => card.id);
    const selected = candidateIds
      .slice(0, requiredCount)
      .reduce<readonly string[]>(
        (current, cardId) => toggleManualCardSelection(current, cardId, requiredCount),
        [],
      );
    assertions.assert(
      selected.length === requiredCount && isManualCardSelectionComplete(selected, requiredCount),
      {
        code: `manual-ui-selection-complete-${requiredCount}`,
        message: `Manual UI selection must complete at ${requiredCount} cards.`,
      },
    );
    const capped = toggleManualCardSelection(selected, candidateIds[requiredCount]!, requiredCount);
    assertions.assert(capped === selected, {
      code: `manual-ui-selection-cap-${requiredCount}`,
      message: `Manual UI selection must reject card ${requiredCount + 1}.`,
    });
    const deselected = toggleManualCardSelection(selected, selected[0]!, requiredCount);
    assertions.assert(
      deselected.length === requiredCount - 1 &&
        !isManualCardSelectionComplete(deselected, requiredCount),
      {
        code: `manual-ui-selection-deselect-${requiredCount}`,
        message: `Manual UI selection must allow deselection before confirmation.`,
      },
    );
  });
  const numerology = createNumerologyProfile('1990-01-01', 'ru', new Date(timestamp));
  const context: TarotReadingContext = {
    birthDate: numerology.birthDate,
    deckTheme: 'cosmic-minimal',
    interests: ['technology'],
    locale: 'ru',
    numerology,
    period: 'week',
    psychologyAnswers: [{ optionId: 'reflect', questionId: 'decision-style' }],
    seed: 'quality-seed',
    selectionMode: 'automatic',
    spreadId: spread.id,
  };
  const first = createTarotReading(context, automatic, timestamp);
  const rerenderNeutral = createTarotReading({ ...context }, [...automatic], timestamp);
  assertions.assert(JSON.stringify(first) === JSON.stringify(rerenderNeutral), {
    code: 'tarot-reading-nondeterministic',
    message: 'Rerender-neutral Tarot input changed the reading.',
  });
  const otherTheme = createTarotReading(
    { ...context, deckTheme: 'deep-water' },
    automatic,
    timestamp,
  );
  assertions.assert(
    JSON.stringify(semanticReading(first)) === JSON.stringify(semanticReading(otherTheme)),
    {
      code: 'deck-theme-affected-meaning',
      message: 'Deck theme changed semantic reading content.',
    },
  );
  const monthSpread = tarotSpreads.find((item) => item.id === 'month');
  if (!monthSpread) throw new Error('Month spread is required for interpretation quality gates.');
  const star = cards.find((card) => card.id === 'major-star');
  const devil = cards.find((card) => card.id === 'major-devil');
  const eightOfCups = cards.find((card) => card.id === 'cups-eight');
  if (!star || !devil || !eightOfCups)
    throw new Error('Canonical interpretation fixtures are missing from the Tarot deck.');
  const starTheme = createActiveCardInterpretation({
    card: star,
    index: 0,
    locale: 'ru',
    orientation: 'upright',
    position: monthSpread.positions[0]!,
  });
  const starWork = createActiveCardInterpretation({
    card: star,
    index: 0,
    locale: 'ru',
    orientation: 'upright',
    position: monthSpread.positions[2]!,
  });
  assertions.assert(starTheme !== starWork && /задач|рабоч|результат/iu.test(starWork), {
    code: 'tarot-interpretation-position-awareness',
    message: 'Changing the spread position must materially change the interpretation context.',
  });
  const starReversed = createActiveCardInterpretation({
    card: star,
    index: 0,
    locale: 'ru',
    orientation: 'reversed',
    position: monthSpread.positions[0]!,
  });
  assertions.assert(
    starTheme !== starReversed &&
      starTheme.includes('надежда') &&
      starReversed.includes('разочарования'),
    {
      code: 'tarot-interpretation-orientation-distinction',
      message: 'Upright and reversed readings must express materially different card meanings.',
    },
  );
  assertions.assert(
    createActiveCardInterpretation({
      card: devil,
      index: 0,
      locale: 'ru',
      orientation: 'upright',
      position: monthSpread.positions[0]!,
    }).includes('привязанность') &&
      createActiveCardInterpretation({
        card: eightOfCups,
        index: 0,
        locale: 'ru',
        orientation: 'upright',
        position: monthSpread.positions[0]!,
      }).includes('эмоционально недостаточной ситуации'),
    {
      code: 'tarot-card-specific-semantic-identity',
      message: 'Canonical card-specific themes must remain visible in active interpretations.',
    },
  );
  const activeInterpretations = cards.flatMap((card, cardIndex) =>
    (['upright', 'reversed'] as const).map((orientation) =>
      createActiveCardInterpretation({
        card,
        index: cardIndex,
        locale: 'ru',
        orientation,
        position: monthSpread.positions[cardIndex % monthSpread.positions.length]!,
      }),
    ),
  );
  assertions.assert(
    activeInterpretations.every((value) => {
      const words = interpretationWordCount(value);
      return words > 0 && words <= 52;
    }),
    {
      code: 'tarot-active-interpretation-length',
      message: 'Active Russian card interpretations must stay concise and no longer than 52 words.',
    },
  );
  assertions.assert(
    activeInterpretations.every(
      (value) =>
        !value.startsWith('Эта карта') &&
        !value.includes('Карта предлагает рассмотреть') &&
        !value.includes('может указывать на'),
    ),
    {
      code: 'tarot-interpretation-generic-phrasing',
      message: 'Active interpretations must not fall back to the old repetitive templates.',
    },
  );
  const monthSelections = createAutomaticSelections(cards, monthSpread, 'quality-month-seed');
  const monthReading = createTarotReading(
    {
      ...context,
      period: 'month',
      seed: 'quality-month-seed',
      spreadId: monthSpread.id,
    },
    monthSelections,
    timestamp,
  );
  const oldConcatenation = monthSelections
    .map((selection) => cards.find((card) => card.id === selection.cardId)?.name.ru)
    .filter(Boolean)
    .join(', ');
  assertions.assert(
    !monthReading.summary.includes(oldConcatenation) &&
      monthReading.summary.includes('снова и снова звучит') &&
      !monthReading.summary.includes('Доминирующий мотив') &&
      !monthReading.summary.includes('Напряжение проходит') &&
      !monthReading.summary.includes('Сильная возможность') &&
      interpretationWordCount(monthReading.summary) >= 120 &&
      interpretationWordCount(monthReading.summary) <= 180,
    {
      code: 'tarot-reading-synthesis-not-concatenation',
      message: 'The final reading must synthesize pattern, opportunity, risk and direction.',
    },
  );
  const unsafeClaims =
    /обязательно произойдёт|точно произойдёт|вы получите деньги|партн[её]р изменяет/iu;
  assertions.assert(
    [...activeInterpretations, monthReading.summary].every((value) => !unsafeClaims.test(value)),
    {
      code: 'tarot-deterministic-future-claims',
      message: 'Built-in interpretation templates must not make deterministic future claims.',
    },
  );
  const roboticPhrases =
    /В позиции|связывает позицию|Практический смысл этой позиции|наблюдаемыми обстоятельствами|конструктивный смысл карты|контекстный рисунок|практический фокус|Сейчас важнее увидеть|Начните с простого|Можно начать с простого|В делах поможет/iu;
  assertions.assert(
    [
      ...activeInterpretations,
      ...monthReading.interpretations.map((item) => item.connections),
      monthReading.summary,
    ].every((value) => !roboticPhrases.test(value)),
    {
      code: 'tarot-human-russian-copy',
      message: 'Russian Tarot copy must not expose mechanical interpretation templates.',
    },
  );
  assertions.assert(russianCardName(eightOfCups) === 'Восьмёрка Кубков', {
    code: 'tarot-natural-russian-card-name',
    message: 'Russian prose must use natural card names instead of UI rank separators.',
  });
  assertions.assert(
    monthReading.interpretations.every(
      (interpretation) => !interpretation.connections.includes(' · '),
    ),
    {
      code: 'tarot-prose-card-name-format',
      message: 'Natural-language Tarot prose must not leak the UI rank separator.',
    },
  );
  assertions.assert(
    monthReading.interpretations.every(
      (interpretation) => interpretationWordCount(interpretation.meaningInPosition) > 0,
    ),
    {
      code: 'tarot-static-fallback-meaningful',
      message:
        'Local fallback interpretations must remain meaningful without an external provider.',
    },
  );
  const corpusPositions = [
    ...new Map(
      tarotSpreads
        .flatMap((spreadItem) => spreadItem.positions)
        .map((position) => [position.id, position] as const),
    ).values(),
  ];
  const corpus = cards.flatMap((card, cardIndex) =>
    corpusPositions.flatMap((position, positionIndex) =>
      (['upright', 'reversed'] as const).map((orientation) =>
        createActiveCardInterpretation({
          card,
          index: positionIndex + cardIndex,
          locale: 'ru',
          orientation,
          position,
        }),
      ),
    ),
  );
  const openerSignatures = corpus.map((value) =>
    value.split(/[.!?]/u)[0]?.trim().toLocaleLowerCase().split(/\s+/u).slice(0, 4).join(' '),
  );
  const openerCounts = new Map<string, number>();
  openerSignatures.forEach((signature) => {
    if (signature) openerCounts.set(signature, (openerCounts.get(signature) ?? 0) + 1);
  });
  assertions.assert(
    new Set(openerSignatures).size >= Math.ceil(corpus.length * 0.05) &&
      Math.max(...openerCounts.values()) <= Math.ceil(corpus.length * 0.08),
    {
      code: 'tarot-interpretation-corpus-repetition',
      message: 'The full card/position/orientation corpus must not reuse one opener excessively.',
    },
  );
  getTarotArtwork(first.selections[0]?.cardId ?? 'major-fool');
  getTarotArtwork('missing-card');
  assertions.assert(JSON.stringify(first) === JSON.stringify(rerenderNeutral), {
    code: 'artwork-provider-affected-meaning',
    message: 'Artwork lookup changed canonical reading data.',
  });
  assertions.assert(
    first.selections.every(
      (selection, index) =>
        selection.orientation === automatic[index]?.orientation &&
        first.interpretations[index]?.orientation === selection.orientation,
    ),
    {
      code: 'orientation-not-preserved',
      message: 'Selection orientation was not preserved in the reading.',
    },
  );
  const cardIds = new Set(cards.map((card) => card.id));
  assertions.assert(
    first.expertInterpretation.sections.every((section) =>
      section.relatedCards.every((cardId) => cardIds.has(cardId)),
    ),
    {
      code: 'invalid-interpretation-card-reference',
      message: 'Expert interpretation references a card outside the standard deck.',
    },
  );
  assertions.assert(
    validateTarotCardIds(negativeQualityFixtures.duplicateTarotCardIds.map((id) => ({ id })))
      .duplicateIds.length > 0,
    {
      code: 'negative-duplicate-card-not-detected',
      message: 'Controlled duplicate Tarot card ID was not rejected.',
    },
  );
  return assertions.result({
    moduleVersions: {
      numerologyCalculation: QUALITY_BASELINE.moduleVersions.numerologyCalculation,
      tarotRules: QUALITY_BASELINE.moduleVersions.tarotRules,
    },
  });
}
