import {
  NUMEROLOGY_ACTIVE_VALUES,
  NUMEROLOGY_KARMIC_VALUES,
  NUMEROLOGY_KNOWLEDGE_ROLES,
  NUMEROLOGY_MASTER_VALUES,
  NUMEROLOGY_NARRATIVE_PURPOSES,
} from '../constants';
import { numerologyArchetypes, numerologyFoundations, numerologyMotifs } from '../data';
import { numerologyTarotResonances } from '../resonance';
import type {
  AuthorNumerologyKnowledgeBase,
  FutureNumerologyModuleContract,
  NumerologyActiveValue,
  NumerologyKarmicKnowledge,
  NumerologyKarmicValue,
  NumerologyKnowledgeRole,
  NumerologyKnowledgeSystem,
  NumerologyMasterPhilosophy,
  NumerologyNarrativeFragment,
  NumerologyNumberKnowledge,
  NumerologyRoleKnowledge,
  NumerologySemanticConcept,
  NumerologySemanticProcess,
  NumerologySemanticTagId,
  PersonalMonthModifier,
  ResolvedNumerologyKnowledge,
  ResolvedPersonalMonthContext,
} from '../types';

type ConceptInput = {
  object: NumerologySemanticTagId;
  polarity?: NumerologySemanticConcept['polarity'];
  process: NumerologySemanticProcess;
  qualifier?: NumerologySemanticTagId;
  subject: NumerologySemanticTagId;
  weight?: NumerologySemanticConcept['weight'];
};

function concept(value: number, field: string, input: ConceptInput): NumerologySemanticConcept {
  return {
    id: `number.${value}.${field}`,
    object: input.object,
    polarity: input.polarity ?? 'neutral',
    process: input.process,
    ...(input.qualifier ? { qualifier: input.qualifier } : {}),
    subject: input.subject,
    weight: input.weight ?? 'supporting',
  };
}

const roleSpecs: Readonly<
  Record<
    NumerologyKnowledgeRole,
    readonly [NumerologySemanticTagId, NumerologySemanticProcess, NumerologySemanticTagId]
  >
> = {
  'life-path': ['growth', 'cultivate', 'responsibility'],
  birthday: ['expression', 'express', 'initiative'],
  attitude: ['communication', 'translate', 'connection'],
  'personal-year': ['transition', 'integrate', 'planning'],
  'personal-month': ['focus', 'refine', 'movement'],
  'personal-day': ['observation', 'test', 'practicality'],
};

function buildRoleKnowledge(
  value: NumerologyActiveValue,
  role: NumerologyKnowledgeRole,
): NumerologyRoleKnowledge {
  const base = numerologyFoundations[value];
  const [roleSubject, roleProcess, roleObject] = roleSpecs[role];
  const field = `role.${role}`;
  return {
    challenge: concept(value, `${field}.challenge`, {
      subject: base.challenge,
      process: 'question',
      object: base.lesson,
      qualifier: roleSubject,
      polarity: 'tensional',
      weight: 'core',
    }),
    commonPattern: concept(value, `${field}.pattern`, {
      subject: base.pattern,
      process: 'observe',
      object: base.secondary,
      qualifier: roleSubject,
    }),
    coreMeaning: concept(value, `${field}.core`, {
      subject: base.primary,
      process: roleProcess,
      object: roleObject,
      qualifier: base.secondary,
      weight: 'core',
    }),
    energy: concept(value, `${field}.energy`, {
      subject: roleSubject,
      process: base.process,
      object: base.primary,
      qualifier: base.pattern,
    }),
    growth: concept(value, `${field}.growth`, {
      subject: base.primary,
      process: 'cultivate',
      object: base.growth,
      qualifier: roleObject,
      polarity: 'integrative',
      weight: 'core',
    }),
    identity: { role, signature: `${value}:${role}:${base.primary}:${base.secondary}`, value },
    innerLesson: concept(value, `${field}.inner-lesson`, {
      subject: base.lesson,
      process: 'integrate',
      object: base.growth,
      qualifier: base.challenge,
      polarity: 'integrative',
    }),
    opportunity: concept(value, `${field}.opportunity`, {
      subject: 'opportunity',
      process: 'explore',
      object: base.strength,
      qualifier: roleSubject,
      polarity: 'supportive',
    }),
    practicalAdvice: concept(value, `${field}.practice`, {
      subject: roleSubject,
      process: 'test',
      object: base.growth,
      qualifier: base.primary,
      polarity: 'supportive',
    }),
    reflection: concept(value, `${field}.reflection`, {
      subject: 'reflection',
      process: 'question',
      object: base.lesson,
      qualifier: base.primary,
    }),
    strength: concept(value, `${field}.strength`, {
      subject: base.strength,
      process: base.process,
      object: base.primary,
      qualifier: roleSubject,
      polarity: 'supportive',
      weight: 'core',
    }),
    warning: concept(value, `${field}.warning`, {
      subject: base.challenge,
      process: 'observe',
      object: base.pattern,
      qualifier: roleSubject,
      polarity: 'tensional',
    }),
  };
}

function masterPhilosophy(value: NumerologyActiveValue): NumerologyMasterPhilosophy | undefined {
  if (!NUMEROLOGY_MASTER_VALUES.includes(value as 11 | 22 | 33)) return undefined;
  const base = numerologyFoundations[value];
  const resonance = value === 11 ? 2 : value === 22 ? 4 : 6;
  return {
    baseResonance: resonance,
    gift: concept(value, 'master.gift', {
      subject: base.strength,
      process: base.process,
      object: base.primary,
      qualifier: 'vision',
      polarity: 'supportive',
      weight: 'core',
    }),
    integration: concept(value, 'master.integration', {
      subject: base.primary,
      process: 'integrate',
      object: base.growth,
      qualifier: 'practicality',
      polarity: 'integrative',
      weight: 'core',
    }),
    practice: concept(value, 'master.practice', {
      subject: base.secondary,
      process: 'ground',
      object: base.lesson,
      qualifier: 'focus',
      polarity: 'supportive',
    }),
    preservedValue: value as 11 | 22 | 33,
    strain: concept(value, 'master.strain', {
      subject: base.challenge,
      process: 'balance',
      object: base.lesson,
      qualifier: base.primary,
      polarity: 'tensional',
      weight: 'core',
    }),
  };
}

function yearPhilosophy(value: NumerologyActiveValue) {
  const base = numerologyFoundations[value];
  return {
    amplified: concept(value, 'year.amplified', {
      subject: base.strength,
      process: base.process,
      object: base.primary,
      qualifier: 'growth',
      polarity: 'supportive',
    }),
    bestDirection: concept(value, 'year.direction', {
      subject: 'decision',
      process: 'direct',
      object: base.growth,
      qualifier: base.lesson,
      polarity: 'integrative',
    }),
    complexity: concept(value, 'year.complexity', {
      subject: base.challenge,
      process: 'balance',
      object: base.pattern,
      qualifier: 'transition',
      polarity: 'tensional',
    }),
    mainTheme: concept(value, 'year.theme', {
      subject: 'transition',
      process: base.process,
      object: base.primary,
      qualifier: base.secondary,
      weight: 'core',
    }),
    rhythm: base.rhythm,
    typicalLesson: concept(value, 'year.lesson', {
      subject: base.lesson,
      process: 'integrate',
      object: base.growth,
      qualifier: base.primary,
    }),
    typicalMistake: concept(value, 'year.mistake', {
      subject: base.pattern,
      process: 'focus',
      object: base.challenge,
      qualifier: base.secondary,
      polarity: 'tensional',
    }),
  } as const;
}

function monthModifier(value: NumerologyActiveValue) {
  const base = numerologyFoundations[value];
  const tempo: PersonalMonthModifier['tempo'] = ['integration', 'consolidation'].includes(
    base.rhythm,
  )
    ? 'steady'
    : base.rhythm === 'reorientation'
      ? 'reflective'
      : base.rhythm === 'expansion'
        ? 'mobile'
        : 'measured';
  return {
    emphasis: concept(value, 'month.emphasis', {
      subject: 'focus',
      process: 'refine',
      object: base.primary,
      qualifier: base.secondary,
      weight: 'core',
    }),
    practicalFocus: concept(value, 'month.practice', {
      subject: 'planning',
      process: 'test',
      object: base.growth,
      qualifier: base.strength,
      polarity: 'supportive',
    }),
    relationToYear: 'redirects' as const,
    tempo,
    value,
  };
}

function dayContext(value: NumerologyActiveValue) {
  const base = numerologyFoundations[value];
  return {
    actionScale: 'micro' as const,
    attention: concept(value, 'day.attention', {
      subject: 'observation',
      process: 'focus',
      object: base.primary,
      qualifier: base.pattern,
      weight: 'core',
    }),
    boundary: concept(value, 'day.boundary', {
      subject: 'boundaries',
      process: 'test',
      object: base.challenge,
      qualifier: 'practicality',
      polarity: 'tensional',
    }),
    tempo:
      base.rhythm === 'reorientation'
        ? ('review' as const)
        : base.rhythm === 'expansion'
          ? ('step' as const)
          : base.rhythm === 'integration'
            ? ('respond' as const)
            : ('pause' as const),
    value,
  };
}

function narrativeFragments(
  value: NumerologyActiveValue,
  roles: NumerologyNumberKnowledge['roleModels'],
): readonly NumerologyNarrativeFragment[] {
  const life = roles['life-path'];
  const year = roles['personal-year'];
  const day = roles['personal-day'];
  const concepts = {
    opening: life.coreMeaning,
    meaning: life.strength,
    challenge: life.challenge,
    growth: life.growth,
    practice: day.practicalAdvice,
    reflection: life.reflection,
    closing: year.innerLesson,
  } as const;
  return NUMEROLOGY_NARRATIVE_PURPOSES.map((purpose) => ({
    conceptIds: [concepts[purpose].id],
    id: `number.${value}.narrative.${purpose}`,
    process: concepts[purpose].process,
    purpose,
    tags: [concepts[purpose].subject, concepts[purpose].object],
  }));
}

function buildNumber(value: NumerologyActiveValue) {
  const base = numerologyFoundations[value];
  const roleModels = Object.fromEntries(
    NUMEROLOGY_KNOWLEDGE_ROLES.map((role) => [role, buildRoleKnowledge(value, role)]),
  ) as unknown as NumerologyNumberKnowledge['roleModels'];
  return {
    archetypeIds: base.archetypeIds,
    career: concept(value, 'career', {
      subject: 'practicality',
      process: 'build',
      object: base.strength,
      qualifier: base.challenge,
    }),
    decisionStyle: concept(value, 'decision', {
      subject: 'decision',
      process: base.process,
      object: base.primary,
      qualifier: base.lesson,
    }),
    identity: {
      isMaster: NUMEROLOGY_MASTER_VALUES.includes(value as 11 | 22 | 33),
      signature: `${value}:${base.primary}:${base.process}:${base.rhythm}`,
      value,
    },
    keywords: [
      `${base.primary}:${base.secondary}`,
      `${base.strength}:${base.process}`,
      `${base.challenge}:${base.lesson}`,
      `${base.growth}:${base.rhythm}`,
    ],
    ...(masterPhilosophy(value) ? { masterPhilosophy: masterPhilosophy(value) } : {}),
    money: concept(value, 'money', {
      subject: 'resource',
      process: 'organize',
      object: base.primary,
      qualifier: 'responsibility',
    }),
    motifIds: base.motifIds,
    narrativeFragments: narrativeFragments(value, roleModels),
    personalDay: dayContext(value),
    personalMonth: monthModifier(value),
    personalYear: yearPhilosophy(value),
    relationships: concept(value, 'relationships', {
      subject: 'connection',
      process: 'balance',
      object: base.secondary,
      qualifier: 'reciprocity',
    }),
    roleModels,
    tagIds: [
      ...new Set([
        base.primary,
        base.secondary,
        base.strength,
        base.challenge,
        base.growth,
        base.lesson,
        base.pattern,
      ]),
    ].sort(),
  } satisfies NumerologyNumberKnowledge;
}

function karmicLesson(value: NumerologyKarmicValue): NumerologyKarmicKnowledge {
  const mapping: Record<
    NumerologyKarmicValue,
    readonly [NumerologySemanticTagId, NumerologySemanticTagId, NumerologySemanticProcess]
  > = {
    13: ['discipline', 'growth', 'build'],
    14: ['freedom', 'responsibility', 'balance'],
    16: ['truth', 'reflection', 'clarify'],
    19: ['autonomy', 'reciprocity', 'integrate'],
  };
  const [subject, object, process] = mapping[value];
  return {
    activeByDefault: false,
    challenge: concept(value, 'karmic.challenge', {
      subject,
      process: 'question',
      object,
      polarity: 'tensional',
    }),
    integration: concept(value, 'karmic.integration', {
      subject,
      process: 'integrate',
      object,
      qualifier: 'responsibility',
      polarity: 'integrative',
    }),
    lesson: concept(value, 'karmic.lesson', {
      subject,
      process,
      object,
      qualifier: 'growth',
      weight: 'core',
    }),
    value,
  };
}

export function buildAuthorNumerologyKnowledgeBase(): AuthorNumerologyKnowledgeBase {
  return {
    archetypes: numerologyArchetypes,
    entries: NUMEROLOGY_ACTIVE_VALUES.map(buildNumber),
    futureModules: (
      [
        ['key2', ['birth-date']],
        ['name-numerology', ['full-name']],
        ['soul-number', ['full-name']],
        ['expression-number', ['full-name']],
        ['destiny-number', ['full-name']],
        ['maturity-number', ['birth-date', 'full-name']],
        ['compatibility', ['birth-date', 'other-profile']],
      ] as const
    ).map(([id, requiredInputs]): FutureNumerologyModuleContract => ({
      calculationImplemented: false,
      id,
      requiredInputs,
      semanticOutput: ['core', 'challenge', 'growth', 'practice', 'relation'],
    })),
    karmicLessons: NUMEROLOGY_KARMIC_VALUES.map(karmicLesson),
    lifeCycleContracts: (['pinnacle', 'challenge', 'life-cycle', 'peak-period'] as const).map(
      (kind) => ({
        calculationImplemented: kind !== 'peak-period',
        calculationSystem: kind === 'peak-period' ? null : ('pythagorean-date-cycles-v1' as const),
        contextRoles: ['foundation', 'lesson', 'peak', 'transition'] as const,
        kind,
        requiredInputs: ['birth-date', 'calculation-system-version'] as const,
        semanticFields: ['theme', 'challenge', 'growth', 'rhythm', 'integration'] as const,
      }),
    ),
    metadata: {
      calculationSystem: 'pythagorean-date-v1',
      schemaVersion: 'author-numerology-schema-v1',
      version: 'author-numerology-knowledge-v1',
    },
    motifs: numerologyMotifs,
    tarotResonances: numerologyTarotResonances,
  };
}

export const authorNumerologyKnowledgeBase = buildAuthorNumerologyKnowledgeBase();

export function resolveNumerologyKnowledge(
  value: number,
  role: NumerologyKnowledgeRole,
  system: NumerologyKnowledgeSystem = 'pythagorean-date-v1',
): ResolvedNumerologyKnowledge {
  if (system !== 'pythagorean-date-v1')
    throw new Error(`Numerology knowledge system is not implemented: ${system}.`);
  const number = authorNumerologyKnowledgeBase.entries.find(
    (entry) => entry.identity.value === value,
  );
  if (!number) throw new Error(`Unknown author numerology value: ${value}.`);
  return { narrativeFragments: number.narrativeFragments, number, role: number.roleModels[role] };
}

export function resolvePersonalMonthContext(
  yearValue: number,
  monthValue: number,
): ResolvedPersonalMonthContext {
  const year = authorNumerologyKnowledgeBase.entries.find(
    (entry) => entry.identity.value === yearValue,
  );
  const month = authorNumerologyKnowledgeBase.entries.find(
    (entry) => entry.identity.value === monthValue,
  );
  if (!year || !month)
    throw new Error('Personal period values require active numerology knowledge.');
  const relation =
    yearValue === monthValue
      ? 'reinforces'
      : year.tagIds.some((tag) => month.tagIds.includes(tag))
        ? 'grounds'
        : monthValue > yearValue
          ? 'opens'
          : Math.abs(monthValue - yearValue) <= 2
            ? 'redirects'
            : 'contrasts';
  return {
    month: { ...month.personalMonth, relationToYear: relation },
    relation,
    year: year.personalYear,
  };
}

export function resolveAdvancedNumerologyKnowledge(
  kind: 'challenge' | 'life-cycle' | 'pinnacle',
  value: number,
) {
  const contract = authorNumerologyKnowledgeBase.lifeCycleContracts.find(
    (item) => item.kind === kind,
  );
  const number = authorNumerologyKnowledgeBase.entries.find(
    (entry) => entry.identity.value === value,
  );
  if (!contract?.calculationImplemented || !contract.calculationSystem)
    throw new Error(`Advanced numerology knowledge is inactive: ${kind}.`);
  if (!number) throw new Error(`Advanced numerology value has no knowledge entry: ${value}.`);
  return { contract, number };
}
