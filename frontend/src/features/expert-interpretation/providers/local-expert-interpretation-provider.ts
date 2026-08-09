import { composeInterpretationResult, composeInterpretationThemes } from '../composition';
import {
  createNarrativeCompositionRequest,
  localNarrativeComposer,
  narrativeMemoryContextFromContinuity,
  type NarrativeComposer,
  type NarrativeComposition,
} from '@features/narrative-composition';
import {
  hasReadingContinuity,
  selectReadingContinuityContext,
  type JourneyMemoryProvider,
  type ReadingContinuityContext,
} from '@features/journey-memory';
import {
  localCrossSystemReasoningProvider,
  type CrossSystemReasoningProvider,
  type CrossSystemResult,
} from '@features/cross-system-reasoning';
import { EXPERT_INTERPRETATION_VERSIONS } from '../constants/versions';
import { buildInterpretationContext } from '../context';
import { normalizeInterpretationEvidence } from '../evidence';
import { resolveInterpretationConnections } from '../rules';
import type {
  InterpretationConnection,
  InterpretationContext,
  InterpretationExecutionOptions,
  InterpretationProvider,
  InterpretationRequest,
  InterpretationResult,
  InterpretationSignal,
  InterpretationValidationReport,
  ThemeComposition,
} from '../types';
import { validateInterpretationResult } from '../validation';

export class LocalExpertInterpretationProvider implements InterpretationProvider {
  constructor(
    private readonly narrativeComposer: NarrativeComposer = localNarrativeComposer,
    readonly reasoningProvider: CrossSystemReasoningProvider = localCrossSystemReasoningProvider,
    private readonly journeyMemoryProvider: JourneyMemoryProvider | null = null,
  ) {}

  buildContext(request: InterpretationRequest): InterpretationContext {
    return buildInterpretationContext(request);
  }

  collectEvidence(context: InterpretationContext): readonly InterpretationSignal[] {
    return normalizeInterpretationEvidence(context);
  }

  resolveConnections(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
  ): readonly InterpretationConnection[] {
    return resolveInterpretationConnections(context, evidence);
  }

  composeThemes(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
  ): ThemeComposition {
    return composeInterpretationThemes(context, evidence, connections);
  }

  composeNarrative(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
    fingerprint: string,
    reasoning: CrossSystemResult,
    options: InterpretationExecutionOptions = {},
  ): NarrativeComposition {
    const continuity = options.continuityContext;
    return this.narrativeComposer.compose(
      createNarrativeCompositionRequest({
        composition,
        connections,
        context,
        evidence,
        fingerprint,
        ...(continuity && hasReadingContinuity(continuity)
          ? { memory: narrativeMemoryContextFromContinuity(continuity) }
          : {}),
        mode:
          options.narrativeMode ??
          (continuity && hasReadingContinuity(continuity) ? 'journey' : 'standard'),
        reasoning,
      }),
    );
  }

  reason(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
    continuityContext: ReadingContinuityContext | null = null,
  ): CrossSystemResult {
    const sourceEngineVersions = {
      ...EXPERT_INTERPRETATION_VERSIONS,
      ...(context.numerology?.advanced
        ? { numerologyCycles: context.numerology.advanced.calculationSystem }
        : {}),
    };
    return this.reasoningProvider.reason({
      composition,
      connections,
      continuityContext,
      context,
      evidence,
      journeyMemory: null,
      sourceEngineVersions,
    });
  }

  private resolveContinuity(
    context: InterpretationContext,
    composition: ThemeComposition,
    options: InterpretationExecutionOptions,
  ) {
    if (options.continuityContext !== undefined)
      return options.continuityContext && hasReadingContinuity(options.continuityContext)
        ? options.continuityContext
        : null;
    const snapshot = (options.journeyMemoryProvider ?? this.journeyMemoryProvider)?.getSnapshot();
    if (!snapshot) return null;
    const continuity = selectReadingContinuityContext(snapshot, {
      cardIds: context.tarot.cards.map((card) => card.id),
      ...(options.currentReadingId ? { currentReadingId: options.currentReadingId } : {}),
      numberValues: context.numerology?.numbers.map((number) => number.value) ?? [],
      sourceEngineVersions: {
        ...EXPERT_INTERPRETATION_VERSIONS,
        ...(context.numerology?.advanced
          ? { numerologyCycles: context.numerology.advanced.calculationSystem }
          : {}),
      },
      spreadId: context.tarot.spreadId,
      themeIds: composition.themes.map((theme) => theme.semanticId),
      topic: context.tarot.topic ?? null,
    });
    return hasReadingContinuity(continuity) ? continuity : null;
  }

  generateInterpretation(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
  ): InterpretationResult {
    return composeInterpretationResult(context, evidence, connections, composition);
  }

  validateResult(result: InterpretationResult): InterpretationValidationReport {
    return validateInterpretationResult(result);
  }

  interpret(request: InterpretationRequest, options: InterpretationExecutionOptions = {}) {
    const context = this.buildContext(request);
    const evidence = this.collectEvidence(context);
    const connections = this.resolveConnections(context, evidence);
    const composition = this.composeThemes(context, evidence, connections);
    const result = this.generateInterpretation(context, evidence, connections, composition);
    const continuity = this.resolveContinuity(context, composition, options);
    const reasoning = this.reason(context, evidence, connections, composition, continuity);
    const narrative = this.composeNarrative(
      context,
      evidence,
      connections,
      composition,
      result.metadata.requestFingerprint,
      reasoning,
      { ...options, continuityContext: continuity },
    );
    return {
      continuity,
      narrative,
      narrativeValidation: this.narrativeComposer.validate(narrative),
      reasoning,
      reasoningValidation: this.reasoningProvider.validate(reasoning),
      result,
      validation: this.validateResult(result),
    };
  }
}

export const localExpertInterpretationProvider = new LocalExpertInterpretationProvider();
