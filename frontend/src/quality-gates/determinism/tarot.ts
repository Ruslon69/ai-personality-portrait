import { createNumerologyProfile } from '../../features/numerology/lib/numerology-engine';
import { tarotArtworkManifest } from '../../assets/tarot';
import {
  isManualCardSelectionComplete,
  toggleManualCardSelection,
} from '../../features/tarot/components/manual-selection-state';
import { deckThemes, standardTarotDeck, tarotSpreads } from '../../features/tarot/data';
import {
  createAutomaticSelections,
  createManualSelections,
} from '../../features/tarot/lib/selection-engine';
import { createTarotReading } from '../../features/tarot/lib/reading-engine';
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
    cards.every((card) => tarotArtworkManifest.get(card.id)?.rightsStatus === 'placeholder'),
    {
      code: 'tarot-artwork-fallback-coverage',
      message: 'Every Tarot card must have a rights-aware fallback artwork entry.',
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
