import { standardTarotDeck } from '../../tarot/data/deck';
import { TAROT_SYMBOLIC_MOTIF_IDS } from '../../tarot-knowledge/constants';
import {
  NUMEROLOGY_ACTIVE_VALUES,
  NUMEROLOGY_ARCHETYPE_IDS,
  NUMEROLOGY_KARMIC_VALUES,
  NUMEROLOGY_KNOWLEDGE_ROLES,
  NUMEROLOGY_MASTER_VALUES,
  NUMEROLOGY_MOTIF_IDS,
  NUMEROLOGY_NARRATIVE_PURPOSES,
  NUMEROLOGY_SEMANTIC_PROCESSES,
  NUMEROLOGY_SEMANTIC_TAGS,
} from '../constants';
import { serializeNumerologyKnowledgeBase } from '../serialization';
import type {
  AuthorNumerologyKnowledgeBase,
  NumerologyKnowledgeValidationError,
  NumerologyKnowledgeValidationResult,
  NumerologyNumberKnowledge,
  NumerologySemanticConcept,
} from '../types';

function allConcepts(entry: NumerologyNumberKnowledge): readonly NumerologySemanticConcept[] {
  return [
    entry.relationships,
    entry.career,
    entry.money,
    entry.decisionStyle,
    entry.personalYear.mainTheme,
    entry.personalYear.amplified,
    entry.personalYear.complexity,
    entry.personalYear.bestDirection,
    entry.personalYear.typicalLesson,
    entry.personalYear.typicalMistake,
    entry.personalMonth.emphasis,
    entry.personalMonth.practicalFocus,
    entry.personalDay.attention,
    entry.personalDay.boundary,
    ...Object.values(entry.roleModels).flatMap((role) => [
      role.coreMeaning,
      role.strength,
      role.challenge,
      role.growth,
      role.innerLesson,
      role.commonPattern,
      role.energy,
      role.warning,
      role.opportunity,
      role.reflection,
      role.practicalAdvice,
    ]),
    ...(entry.masterPhilosophy
      ? [
          entry.masterPhilosophy.gift,
          entry.masterPhilosophy.strain,
          entry.masterPhilosophy.integration,
          entry.masterPhilosophy.practice,
        ]
      : []),
  ];
}

function addDuplicateErrors(
  values: readonly string[],
  path: string,
  errors: NumerologyKnowledgeValidationError[],
) {
  const seen = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value))
      errors.push({ code: 'duplicate-id', message: `Duplicate stable id: ${value}.`, path });
    seen.add(value);
  });
}

export function validateNumerologyKnowledgeRepetition(
  base: AuthorNumerologyKnowledgeBase,
): readonly NumerologyKnowledgeValidationError[] {
  const errors: NumerologyKnowledgeValidationError[] = [];
  const signatures = new Map<string, number>();
  const practical = new Map<string, number>();
  base.entries.forEach((entry) => {
    const signature = [
      entry.roleModels['life-path'].coreMeaning.subject,
      entry.roleModels['life-path'].coreMeaning.process,
      entry.roleModels['life-path'].coreMeaning.object,
      entry.personalYear.rhythm,
    ].join(':');
    const previous = signatures.get(signature);
    if (previous !== undefined)
      errors.push({
        code: 'repetition',
        message: `Number ${entry.identity.value} duplicates number ${previous}.`,
        path: `entries.${entry.identity.value}`,
      });
    signatures.set(signature, entry.identity.value);
    const practiceSignature = [
      entry.roleModels['personal-day'].practicalAdvice.process,
      entry.roleModels['personal-day'].practicalAdvice.object,
      entry.roleModels['personal-day'].practicalAdvice.qualifier,
      entry.personalMonth.practicalFocus.object,
      entry.personalMonth.practicalFocus.qualifier,
    ].join(':');
    const previousPractice = practical.get(practiceSignature);
    if (previousPractice !== undefined)
      errors.push({
        code: 'repetition',
        message: `Number ${entry.identity.value} repeats practical semantics from ${previousPractice}.`,
        path: `entries.${entry.identity.value}.practice`,
      });
    practical.set(practiceSignature, entry.identity.value);
  });
  return errors;
}

export function validateAuthorNumerologyKnowledgeBase(
  base: AuthorNumerologyKnowledgeBase,
): NumerologyKnowledgeValidationResult {
  const errors: NumerologyKnowledgeValidationError[] = [];
  const validTags = new Set(NUMEROLOGY_SEMANTIC_TAGS);
  const validProcesses = new Set(NUMEROLOGY_SEMANTIC_PROCESSES);
  const validArchetypes = new Set(NUMEROLOGY_ARCHETYPE_IDS);
  const validMotifs = new Set(NUMEROLOGY_MOTIF_IDS);
  const values = base.entries.map((entry) => entry.identity.value);
  if (
    base.metadata.calculationSystem !== 'pythagorean-date-v1' ||
    base.metadata.schemaVersion !== 'author-numerology-schema-v1' ||
    base.metadata.version !== 'author-numerology-knowledge-v1'
  )
    errors.push({
      code: 'invalid-enum',
      message: 'Numerology knowledge metadata is unsupported.',
      path: 'metadata',
    });
  if (
    values.length !== NUMEROLOGY_ACTIVE_VALUES.length ||
    NUMEROLOGY_ACTIVE_VALUES.some((value) => !values.includes(value))
  )
    errors.push({
      code: 'invalid-count',
      message: 'Active number coverage is incomplete.',
      path: 'entries',
    });
  addDuplicateErrors(values.map(String), 'entries', errors);
  addDuplicateErrors(
    base.tarotResonances.map((item) => item.id),
    'tarotResonances',
    errors,
  );
  const conceptIds = base.entries.flatMap((entry) => [
    ...allConcepts(entry).map((item) => item.id),
    ...entry.narrativeFragments.map((item) => item.id),
  ]);
  addDuplicateErrors(conceptIds, 'entries.semanticIds', errors);
  base.entries.forEach((entry) => {
    const path = `entries.${entry.identity.value}`;
    if (
      !entry.identity.signature ||
      entry.keywords.length < 4 ||
      entry.keywords.some((item) => !item)
    )
      errors.push({
        code: 'empty-field',
        message: 'Number identity or keywords are incomplete.',
        path,
      });
    if (NUMEROLOGY_KNOWLEDGE_ROLES.some((role) => !entry.roleModels[role]))
      errors.push({
        code: 'invalid-count',
        message: 'Role models are incomplete.',
        path: `${path}.roleModels`,
      });
    if (
      NUMEROLOGY_NARRATIVE_PURPOSES.some(
        (purpose) => !entry.narrativeFragments.some((item) => item.purpose === purpose),
      )
    )
      errors.push({
        code: 'invalid-count',
        message: 'Narrative fragments are incomplete.',
        path: `${path}.narrativeFragments`,
      });
    const entryConceptIds = new Set(allConcepts(entry).map((item) => item.id));
    entry.narrativeFragments.forEach((fragment) => {
      if (
        !NUMEROLOGY_NARRATIVE_PURPOSES.includes(fragment.purpose) ||
        !validProcesses.has(fragment.process) ||
        fragment.tags.some((tag) => !validTags.has(tag)) ||
        fragment.conceptIds.some((id) => !entryConceptIds.has(id))
      )
        errors.push({
          code: 'broken-reference',
          message: `Invalid narrative fragment ${fragment.id}.`,
          path: `${path}.narrativeFragments`,
        });
    });
    entry.tagIds.forEach((tag) => {
      if (!validTags.has(tag))
        errors.push({
          code: 'invalid-enum',
          message: `Unknown tag ${tag}.`,
          path: `${path}.tagIds`,
        });
    });
    entry.archetypeIds.forEach((id) => {
      if (!validArchetypes.has(id))
        errors.push({
          code: 'broken-reference',
          message: `Unknown archetype ${id}.`,
          path: `${path}.archetypeIds`,
        });
    });
    entry.motifIds.forEach((id) => {
      if (!validMotifs.has(id))
        errors.push({
          code: 'broken-reference',
          message: `Unknown motif ${id}.`,
          path: `${path}.motifIds`,
        });
    });
    allConcepts(entry).forEach((item) => {
      if (
        !item.id ||
        !validTags.has(item.subject) ||
        !validTags.has(item.object) ||
        (item.qualifier && !validTags.has(item.qualifier)) ||
        !validProcesses.has(item.process)
      )
        errors.push({
          code: 'invalid-enum',
          message: `Invalid semantic concept ${item.id}.`,
          path,
        });
    });
    const isMaster = NUMEROLOGY_MASTER_VALUES.includes(entry.identity.value as 11 | 22 | 33);
    if (
      entry.identity.isMaster !== isMaster ||
      isMaster !== Boolean(entry.masterPhilosophy) ||
      (entry.masterPhilosophy && entry.masterPhilosophy.preservedValue !== entry.identity.value)
    )
      errors.push({
        code: 'invalid-master',
        message: 'Master-number philosophy is inconsistent.',
        path: `${path}.masterPhilosophy`,
      });
  });
  if (
    base.archetypes.length !== NUMEROLOGY_ARCHETYPE_IDS.length ||
    NUMEROLOGY_ARCHETYPE_IDS.some((id) => !base.archetypes.some((item) => item.id === id))
  )
    errors.push({
      code: 'invalid-count',
      message: 'Archetype library is incomplete.',
      path: 'archetypes',
    });
  base.archetypes.forEach((archetype) => {
    if (
      !validProcesses.has(archetype.process) ||
      [...archetype.roleTags, ...archetype.giftTags, ...archetype.challengeTags].some(
        (tag) => !validTags.has(tag),
      ) ||
      archetype.motifIds.some((id) => !validMotifs.has(id))
    )
      errors.push({
        code: 'broken-reference',
        message: `Invalid archetype ${archetype.id}.`,
        path: `archetypes.${archetype.id}`,
      });
  });
  if (
    base.motifs.length !== NUMEROLOGY_MOTIF_IDS.length ||
    NUMEROLOGY_MOTIF_IDS.some((id) => !base.motifs.some((item) => item.id === id))
  )
    errors.push({ code: 'invalid-count', message: 'Motif library is incomplete.', path: 'motifs' });
  base.motifs.forEach((motif) => {
    if (
      !validProcesses.has(motif.process) ||
      [...motif.themeTags, ...motif.tensionTags].some((tag) => !validTags.has(tag))
    )
      errors.push({
        code: 'invalid-enum',
        message: `Invalid motif ${motif.id}.`,
        path: `motifs.${motif.id}`,
      });
  });
  if (
    base.karmicLessons.length !== 4 ||
    NUMEROLOGY_KARMIC_VALUES.some(
      (value) =>
        !base.karmicLessons.some((item) => item.value === value && item.activeByDefault === false),
    )
  )
    errors.push({
      code: 'invalid-count',
      message: 'Karmic knowledge coverage is incomplete or active by default.',
      path: 'karmicLessons',
    });
  base.karmicLessons
    .flatMap((item) => [item.challenge, item.lesson, item.integration])
    .forEach((item) => {
      if (
        !validTags.has(item.subject) ||
        !validTags.has(item.object) ||
        (item.qualifier && !validTags.has(item.qualifier)) ||
        !validProcesses.has(item.process)
      )
        errors.push({
          code: 'invalid-enum',
          message: `Invalid karmic concept ${item.id}.`,
          path: 'karmicLessons',
        });
    });
  const activeLifeCycleKinds = new Set(['pinnacle', 'challenge', 'life-cycle']);
  if (
    base.lifeCycleContracts.length !== 4 ||
    base.lifeCycleContracts.some(
      (item) =>
        item.calculationImplemented !== activeLifeCycleKinds.has(item.kind) ||
        (item.calculationImplemented
          ? item.calculationSystem !== 'pythagorean-date-cycles-v1'
          : item.calculationSystem !== null),
    )
  )
    errors.push({
      code: 'invalid-count',
      message: 'Life-cycle knowledge activation does not match implemented calculations.',
      path: 'lifeCycleContracts',
    });
  if (
    base.futureModules.length !== 7 ||
    base.futureModules.some((item) => item.calculationImplemented !== false)
  )
    errors.push({
      code: 'invalid-count',
      message: 'Future numerology module contracts are incomplete.',
      path: 'futureModules',
    });
  const tarotMotifs = new Set<string>(TAROT_SYMBOLIC_MOTIF_IDS);
  if (NUMEROLOGY_MOTIF_IDS.some((id) => tarotMotifs.has(id)))
    errors.push({
      code: 'invalid-enum',
      message: 'Numerology motifs must remain distinct from Tarot motifs.',
      path: 'motifs',
    });
  const tarotIds = new Set(standardTarotDeck.cards.map((card) => card.id));
  base.tarotResonances.forEach((relation) => {
    if (
      !values.includes(relation.value) ||
      relation.cardIds.some((id) => !tarotIds.has(id)) ||
      relation.reasonTags.some((tag) => !validTags.has(tag))
    )
      errors.push({
        code: 'broken-reference',
        message: `Invalid Tarot resonance ${relation.id}.`,
        path: `tarotResonances.${relation.id}`,
      });
  });
  if (
    NUMEROLOGY_ACTIVE_VALUES.some(
      (value) => !base.tarotResonances.some((relation) => relation.value === value),
    )
  )
    errors.push({
      code: 'invalid-count',
      message: 'Tarot resonance coverage is incomplete.',
      path: 'tarotResonances',
    });
  errors.push(...validateNumerologyKnowledgeRepetition(base));
  try {
    serializeNumerologyKnowledgeBase(base);
  } catch (caught) {
    errors.push({
      code: 'non-serializable',
      message: caught instanceof Error ? caught.message : 'Knowledge base is not serializable.',
      path: '$',
    });
  }
  return { errors, valid: errors.length === 0 };
}
