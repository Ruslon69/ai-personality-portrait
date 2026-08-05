import type { PersonalityProfile } from '@entities/personality-profile';
import { tarotCardById } from '@features/tarot';
import type { JourneyReadingRecord, JourneyState } from '@features/journey';

import type {
  JourneyMemoryPracticalFocus,
  JourneyMemorySource,
  JourneyRecommendationCategory,
} from '../types';
import { uniqueSorted } from '../utils';

function recommendationCategory(semanticId: string): JourneyRecommendationCategory {
  const normalized = semanticId.toLowerCase();
  if (normalized.includes('boundary')) return 'boundaries';
  if (normalized.includes('conversation') || normalized.includes('love')) return 'conversation';
  if (normalized.includes('pause') || normalized.includes('hermit')) return 'pause';
  if (normalized.includes('recover') || normalized.includes('rest')) return 'recovery';
  if (normalized.includes('plan') || normalized.includes('structure')) return 'planning';
  if (normalized.includes('support')) return 'support-seeking';
  if (normalized.includes('complete') || normalized.includes('world')) return 'completion';
  if (normalized.includes('choice') || normalized.includes('decision')) return 'decision';
  return 'experimentation';
}

function tarotSource(record: JourneyReadingRecord): JourneyMemorySource {
  const { reading } = record;
  const expert = reading.expertInterpretation;
  const practicalFocuses: JourneyMemoryPracticalFocus[] = expert.recommendations.map(
    (recommendation) => {
      const semanticTheme =
        expert.themes.find((theme) => theme.id === recommendation.relatedThemeId)?.semanticId ??
        recommendation.relatedThemeId;
      const authored = expert.content.sections
        .flatMap((section) => section.blocks)
        .find((block) => block.kind === 'practical-focus');
      return {
        category: recommendationCategory(semanticTheme),
        semanticId: `practical.${semanticTheme}`,
        sourceIds: recommendation.sources,
        text: authored?.text ?? reading.practicalFocus,
      };
    },
  );
  const numbers = [
    reading.context.numerology.lifePath,
    reading.context.numerology.birthday,
    reading.context.numerology.attitude,
    reading.context.numerology.personalYear,
    reading.context.numerology.personalMonth,
    reading.context.numerology.personalDay,
  ];
  return {
    bookmarked: record.favorite,
    cards: reading.selections.map((selection) => {
      const card = tarotCardById.get(selection.cardId);
      if (!card) throw new Error(`Unknown Tarot card in Journey state: ${selection.cardId}`);
      return {
        arcana: card.arcana,
        id: card.id,
        number: card.number,
        orientation: selection.orientation,
        positionId: selection.positionId,
        reversedMode: selection.orientation === 'reversed' ? 'reversed' : null,
        suit: card.suit ?? null,
      };
    }),
    createdAt: record.savedAt,
    engineVersions: expert.metadata.versions,
    headline: reading.headline,
    id: reading.id,
    kind: 'tarot-reading',
    locale: reading.context.locale,
    numbers: numbers.map((number) => ({
      calculationId: number.id,
      systemVersion: reading.context.numerology.system,
      value: number.value,
    })),
    period: reading.context.period ?? null,
    practicalFocuses,
    quoteSources: [
      ...expert.content.sections.slice(0, 2).map((section, index) => ({
        id: section.id,
        kind: 'authored-section' as const,
        strength: index === 0 ? ('primary' as const) : ('secondary' as const),
        text: section.headline,
      })),
      ...practicalFocuses.slice(0, 1).map((focus) => ({
        id: focus.semanticId,
        kind: 'practical-focus' as const,
        strength: 'secondary' as const,
        text: focus.text,
      })),
    ],
    readingType: reading.spreadId,
    reflections: expert.content.sections.flatMap((section) =>
      section.blocks
        .filter((block) => block.kind === 'reflection-question')
        .map((block) => ({
          semanticId: `reflection.${section.sectionId}`,
          sourceIds: block.sourceIds,
          text: block.text,
        })),
    ),
    sourceReferences: uniqueSorted([
      `reading:${reading.id}`,
      ...expert.themes.map((theme) => `theme:${theme.id}`),
      ...reading.selections.map((selection) => `card:${selection.cardId}`),
    ]).map((id) => ({
      id,
      kind: id.startsWith('card:')
        ? ('card' as const)
        : id.startsWith('reading:')
          ? ('reading' as const)
          : ('theme' as const),
      source: id.startsWith('card:') ? ('tarot-card' as const) : ('journey' as const),
    })),
    spreadId: reading.spreadId,
    themes: expert.themes.map((theme) => ({
      cardIds: theme.relatedCards,
      numberValues: theme.relatedNumbers,
      role: theme.role,
      semanticId: theme.semanticId,
      sourceIds: theme.sources,
    })),
    topic: reading.context.topic ?? null,
    zodiac: {
      element: reading.context.numerology.zodiac.element,
      modality: reading.context.numerology.zodiac.modality,
      signId: reading.context.numerology.zodiac.signId,
    },
  };
}

export function journeyStateToMemorySources(state: JourneyState): readonly JourneyMemorySource[] {
  return state.readings.map(tarotSource);
}

export function personalityProfileToMemorySource(
  profile: PersonalityProfile,
  bookmarked = false,
): JourneyMemorySource {
  const insights = [profile.overview, ...profile.strengths, ...profile.growthAreas];
  const sourceIds = ['personality-profile'] as const;
  return {
    bookmarked,
    cards: [],
    createdAt: profile.createdAt,
    engineVersions: { personalityProfile: 'personality-profile-v1' },
    headline: profile.revealHeadline,
    id: profile.id,
    kind: 'personality-profile',
    locale: profile.locale,
    numbers: [],
    period: null,
    practicalFocuses: profile.recommendations.map((recommendation) => ({
      category: recommendationCategory(recommendation.category),
      semanticId: `practical.profile.${recommendation.id}`,
      sourceIds,
      text: recommendation.description,
    })),
    quoteSources: insights.slice(0, 2).map((insight, index) => ({
      id: insight.id,
      kind: 'authored-section',
      strength: index === 0 ? 'primary' : 'secondary',
      text: insight.title,
    })),
    readingType: 'personality-profile',
    reflections: [],
    sourceReferences: profile.sourceDetails.map((source) => ({
      id: source.id,
      kind: 'profile',
      source: 'personality-profile',
    })),
    spreadId: null,
    themes: insights.map((insight, index) => ({
      cardIds: [],
      numberValues: [],
      role: index === 0 ? 'leading' : 'supporting',
      semanticId: `theme.profile.${insight.id}`,
      sourceIds,
    })),
    topic: null,
    zodiac: null,
  };
}

export type JourneyMemoryStateMigration = {
  generatedAt: string;
  snapshotVersion: 'journey-memory-v1';
  sources: readonly JourneyMemorySource[];
};

export function prepareJourneyMemoryMigration(
  state: JourneyState,
  generatedAt: string,
): JourneyMemoryStateMigration {
  return {
    generatedAt,
    snapshotVersion: 'journey-memory-v1',
    sources: journeyStateToMemorySources(state),
  };
}
