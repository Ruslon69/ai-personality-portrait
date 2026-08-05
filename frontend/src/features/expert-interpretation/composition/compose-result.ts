import { EXPERT_INTERPRETATION_VERSIONS } from '../constants';
import { assembleAuthorInterpretationContent } from '../content';
import type {
  InterpretationConfidence,
  InterpretationConnection,
  InterpretationContext,
  InterpretationEvidence,
  InterpretationResult,
  InterpretationSection,
  InterpretationSectionKind,
  InterpretationSignal,
  InterpretationTheme,
  ThemeComposition,
} from '../types';
import { stableHash, stableId, stableStringify, uniqueSorted } from '../utils';
import { createInterpretationWording } from '../wording';

function confidenceFor(theme: InterpretationTheme): InterpretationConfidence {
  if (theme.evidenceIds.length < 2) {
    return { level: 'low', uncertainty: 'limited-context' };
  }
  if (theme.sources.some((source) => ['numerology', 'tarot-card', 'zodiac'].includes(source))) {
    return { level: 'interpretive', uncertainty: 'symbolic-interpretation' };
  }
  return { level: 'medium', uncertainty: 'contextual-inference' };
}

function sectionKind(theme: InterpretationTheme): InterpretationSectionKind {
  if (theme.role === 'leading') return 'leading-theme';
  if (theme.tensionIds.length) return 'tension';
  if (theme.kind === 'period') return 'period-context';
  if (theme.kind === 'practical') return 'practical-focus';
  if (theme.kind === 'symbolic') return 'symbolic-lens';
  return 'supporting-theme';
}

function createSection(
  theme: InterpretationTheme,
  context: InterpretationContext,
  connections: readonly InterpretationConnection[],
): InterpretationSection {
  const relationship = connections.find((connection) =>
    theme.connectionIds.includes(connection.id),
  );
  const confidence = confidenceFor(theme);
  const wording = createInterpretationWording({
    confidence,
    context,
    relationship: relationship?.kind ?? null,
    theme,
  });
  return {
    confidence,
    details: [wording.openingConcept, wording.connectionConcept],
    evidence: theme.evidenceIds,
    id: stableId('section', theme.id),
    kind: sectionKind(theme),
    practicalFocus: wording.practicalConcept,
    reflectionQuestion: wording.reflectionConcept,
    relatedCards: theme.relatedCards,
    relatedContext: theme.relatedContext,
    relatedNumbers: theme.relatedNumbers,
    sources: theme.sources,
    summary: wording.headlineConcept,
    titleKey: `interpretation.section.${theme.semanticId}`,
    uncertaintyNote: wording.uncertaintyConcept,
  };
}

function semanticFingerprint(context: InterpretationContext) {
  return stableHash(
    stableStringify({
      interests: context.interests,
      locale: context.locale,
      numerology: context.numerology,
      psychology: context.psychology,
      seed: context.metadata.deterministicSeed,
      tarot: {
        cards: context.tarot.cards,
        leadingCardId: context.tarot.leadingCardId,
        period: context.tarot.period ?? null,
        spreadId: context.tarot.spreadId,
        topic: context.tarot.topic ?? null,
      },
      zodiac: context.zodiac,
    }),
  );
}

function publicEvidence(
  signals: readonly InterpretationSignal[],
): readonly InterpretationEvidence[] {
  return signals.map((signal) => {
    const base: InterpretationEvidence = {
      id: signal.id,
      polarity: signal.polarity,
      provenance: signal.provenance,
      reliability: signal.reliability,
      scope: signal.scope,
      semanticType: signal.semanticType,
      source: signal.source,
      strength: signal.strength,
      value: signal.value,
    };
    return signal.reference ? { ...base, reference: signal.reference } : base;
  });
}

export function composeInterpretationResult(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
  connections: readonly InterpretationConnection[],
  composition: ThemeComposition,
): InterpretationResult {
  const requestFingerprint = semanticFingerprint(context);
  const numberValues = uniqueSorted([
    ...(context.numerology?.numbers.map((number) => number.value) ?? []),
    ...context.tarot.cards.map((card) => card.number),
  ]);
  const publicSignals = publicEvidence(evidence);
  const sections = composition.themes.map((theme) => createSection(theme, context, connections));
  return {
    connections,
    content: assembleAuthorInterpretationContent({
      composition,
      connections,
      context,
      evidence: publicSignals,
      fingerprint: requestFingerprint,
      sections,
    }),
    evidence: publicSignals,
    id: `expert-reading:${requestFingerprint}`,
    leadingThemeId: composition.leadingThemeId,
    metadata: {
      cardIds: context.tarot.cards.map((card) => card.id),
      deterministicSeed: context.metadata.deterministicSeed,
      generatedAt: context.metadata.generatedAt,
      locale: context.locale,
      numberValues,
      requestFingerprint,
      sourceAvailability: context.metadata.sourceAvailability,
      versions: EXPERT_INTERPRETATION_VERSIONS,
    },
    recommendations: composition.recommendations,
    sections,
    tensions: composition.tensions,
    themes: composition.themes,
  };
}
