import {
  localExpertInterpretationProvider,
  createAdvancedInterpretationNumerologyInput,
  type AuthorInterpretationBlock,
  type InterpretationResult,
  type InterpretationExecutionOptions,
  type InterpretationNumerologyNumberInput,
  type InterpretationRequest,
} from '@features/expert-interpretation';
import { authorNumerologyKnowledgeBase } from '@features/numerology-knowledge';
import { authorTarotKnowledgeBase } from '@features/tarot-knowledge';
import { JOURNEY_MEMORY_VERSIONS, type JourneyMemorySnapshot } from '@features/journey-memory';
import { MASTER_NUMBERS } from '@features/numerology';

import { tarotCardById } from '../data';
import type {
  TarotCardSelection,
  TarotInterpretation,
  TarotReading,
  TarotReadingContext,
  ReadingEngineLineage,
} from '../types';

const numberIdMap = {
  attitude: 'first-impression',
  birthday: 'birthday',
  'life-path': 'life-path',
  'personal-day': 'personal-day',
  'personal-month': 'personal-month',
  'personal-year': 'personal-year',
} as const satisfies Record<string, InterpretationNumerologyNumberInput['id']>;

export function createExpertInterpretationRequest(
  context: TarotReadingContext,
  selections: readonly TarotCardSelection[],
  generatedAt: string,
): InterpretationRequest {
  const numbers = [
    context.numerology.lifePath,
    context.numerology.birthday,
    context.numerology.attitude,
    context.numerology.personalYear,
    context.numerology.personalMonth,
    context.numerology.personalDay,
  ].map((number): InterpretationNumerologyNumberInput => ({
    id: numberIdMap[number.id],
    sourceDigits: number.sourceDigits,
    value: number.value,
  }));
  const selectedInterests = context.interests.filter((interest) => !interest.startsWith('other:'));
  const customInterest = context.interests
    .find((interest) => interest.startsWith('other:'))
    ?.slice(6);
  return {
    ...(customInterest ? { customInterest } : {}),
    generatedAt,
    interests: selectedInterests,
    locale: context.locale,
    numerology: {
      ...(context.advancedNumerology
        ? { advanced: createAdvancedInterpretationNumerologyInput(context.advancedNumerology) }
        : {}),
      masterNumbers: numbers
        .map((number) => number.value)
        .filter((value) => MASTER_NUMBERS.includes(value as 11 | 22 | 33)),
      numbers,
      system: context.numerology.system,
    },
    psychologyAnswers: context.psychologyAnswers,
    seed: context.seed,
    tarot: {
      cards: selections.map((selection) => {
        const card = tarotCardById.get(selection.cardId);
        if (!card) throw new Error(`Unknown tarot card: ${selection.cardId}`);
        return {
          arcana: card.arcana,
          baseThemeIds: [
            `card:${card.id}`,
            `arcana:${card.arcana}`,
            `number:${card.number}`,
            ...(card.suit ? [`suit:${card.suit}`] : []),
          ],
          id: card.id,
          number: card.number,
          orientation: selection.orientation,
          positionId: selection.positionId,
          ...(card.suit ? { suit: card.suit } : {}),
        };
      }),
      deckTheme: context.deckTheme,
      leadingCardId: selections[0]?.cardId ?? '',
      ...(context.period ? { period: context.period } : {}),
      spreadId: context.spreadId,
      ...(context.topic ? { topic: context.topic } : {}),
    },
    zodiac: {
      element: context.numerology.zodiac.element,
      modality: context.numerology.zodiac.modality,
      signId: context.numerology.zodiac.signId,
    },
  };
}

export function createExpertInterpretationForTarot(
  context: TarotReadingContext,
  selections: readonly TarotCardSelection[],
  generatedAt: string,
) {
  return createExpertInterpretationBundleForTarot(context, selections, generatedAt).result;
}

export function createExpertInterpretationBundleForTarot(
  context: TarotReadingContext,
  selections: readonly TarotCardSelection[],
  generatedAt: string,
  options: InterpretationExecutionOptions = {},
) {
  const response = localExpertInterpretationProvider.interpret(
    createExpertInterpretationRequest(context, selections, generatedAt),
    options,
  );
  if (!response.validation.valid) {
    throw new Error(
      `Expert interpretation validation failed: ${response.validation.errors[0]?.message ?? 'unknown error'}`,
    );
  }
  if (!response.narrativeValidation.valid) {
    throw new Error(
      `Narrative composition validation failed: ${response.narrativeValidation.errors[0]?.message ?? 'unknown error'}`,
    );
  }
  if (!response.reasoningValidation.valid) {
    throw new Error(
      `Cross-system reasoning validation failed: ${response.reasoningValidation.errors[0]?.message ?? 'unknown error'}`,
    );
  }
  return response;
}

export function createReadingEngineLineage(
  context: TarotReadingContext,
  response: ReturnType<typeof createExpertInterpretationBundleForTarot>,
): ReadingEngineLineage {
  return {
    ...(context.advancedNumerology
      ? {
          advancedCalculationSystem:
            context.advancedNumerology.calculationMetadata.calculationSystem,
        }
      : {}),
    authorContent: response.result.content.version,
    calculationSystem: context.numerology.system,
    crossSystemReasoning: response.reasoning.metadata.versions.engine,
    expertInterpretation: response.result.metadata.versions.engine,
    journeyMemory: response.continuity?.journeySnapshotVersion ?? JOURNEY_MEMORY_VERSIONS.engine,
    narrative: response.narrative.metadata.composerVersion,
    numerologyKnowledge: authorNumerologyKnowledgeBase.metadata.version,
    readingContinuity: response.continuity?.continuityVersion ?? 'reading-continuity-v1',
    status: 'current',
    tarotKnowledge: authorTarotKnowledgeBase.metadata.version,
  };
}

export function enrichTarotReadingWithContinuity(
  reading: TarotReading,
  snapshot: JourneyMemorySnapshot,
): TarotReading {
  const response = createExpertInterpretationBundleForTarot(
    reading.context,
    reading.selections,
    reading.createdAt,
    {
      currentReadingId: reading.id,
      journeyMemoryProvider: { getSnapshot: () => snapshot },
    },
  );
  return {
    ...reading,
    ...(response.continuity && response.continuity.previousRelevantEntries.length
      ? { continuity: response.continuity }
      : {}),
    crossSystemReasoning: response.reasoning,
    expertInterpretation: response.result,
    narrative: response.narrative,
    reasoningVersions: createReadingEngineLineage(reading.context, response),
  };
}

function blockText(
  blocks: readonly AuthorInterpretationBlock[],
  kind: AuthorInterpretationBlock['kind'],
  fallback: string,
) {
  return blocks.find((block) => block.kind === kind)?.text ?? fallback;
}

export type TarotAuthorPresentation = Pick<
  TarotReading,
  'headline' | 'interpretations' | 'practicalFocus' | 'summary'
>;

/**
 * Pure compatibility adapter for the current presentation model.
 * The visible Tarot flow keeps its legacy fields until a UI-reviewed migration is possible.
 */
export function adaptExpertInterpretationToTarotPresentation(
  result: InterpretationResult,
  selections: readonly TarotCardSelection[],
): TarotAuthorPresentation {
  const semanticSections = new Map(result.sections.map((section) => [section.id, section]));
  const authoredByCard = new Map<string, (typeof result.content.sections)[number]>();
  result.content.sections.forEach((section) => {
    const semantic = semanticSections.get(section.sectionId);
    semantic?.relatedCards.forEach((cardId) => {
      if (!authoredByCard.has(cardId)) authoredByCard.set(cardId, section);
    });
  });
  const interpretations: TarotInterpretation[] = selections.map((selection, index) => {
    const section = authoredByCard.get(selection.cardId) ?? result.content.sections[index];
    const blocks = section?.blocks ?? [];
    const fallback = section?.opening ?? result.content.opening;
    return {
      cardId: selection.cardId,
      connections: blockText(blocks, 'card-connections', fallback),
      contextLink: blockText(blocks, 'contextual-meaning', fallback),
      headline: section?.headline ?? result.content.headline,
      id: `author:${selection.positionId}:${selection.cardId}`,
      meaningInPosition: blockText(blocks, 'card-position-meaning', fallback),
      numerologyLink: blockText(blocks, 'numerology-connection', fallback),
      orientation: selection.orientation,
      positionId: selection.positionId,
      practicalTheme: blockText(blocks, 'practical-focus', fallback),
      reflectionQuestion: blockText(blocks, 'reflection-question', fallback),
      uncertainty: blockText(blocks, 'uncertainty-note', result.content.closing),
    };
  });
  return {
    headline: result.content.headline,
    interpretations,
    practicalFocus:
      result.content.sections
        .flatMap((section) => section.blocks)
        .find((block) => block.kind === 'practical-focus')?.text ?? result.content.closing,
    summary: result.content.opening,
  };
}
