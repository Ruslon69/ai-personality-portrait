import { composeInterpretationResult, composeInterpretationThemes } from '../composition';
import {
  createNarrativeCompositionRequest,
  localNarrativeComposer,
  type NarrativeComposer,
  type NarrativeComposition,
} from '@features/narrative-composition';
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
  ): NarrativeComposition {
    return this.narrativeComposer.compose(
      createNarrativeCompositionRequest({
        composition,
        connections,
        context,
        evidence,
        fingerprint,
        reasoning,
      }),
    );
  }

  reason(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
  ): CrossSystemResult {
    return this.reasoningProvider.reason({
      composition,
      connections,
      context,
      evidence,
      journeyMemory: null,
      sourceEngineVersions: EXPERT_INTERPRETATION_VERSIONS,
    });
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

  interpret(request: InterpretationRequest) {
    const context = this.buildContext(request);
    const evidence = this.collectEvidence(context);
    const connections = this.resolveConnections(context, evidence);
    const composition = this.composeThemes(context, evidence, connections);
    const result = this.generateInterpretation(context, evidence, connections, composition);
    const reasoning = this.reason(context, evidence, connections, composition);
    const narrative = this.composeNarrative(
      context,
      evidence,
      connections,
      composition,
      result.metadata.requestFingerprint,
      reasoning,
    );
    return {
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
