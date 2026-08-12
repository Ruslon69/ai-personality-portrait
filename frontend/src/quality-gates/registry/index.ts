import { EXPERT_INTERPRETATION_VERSIONS } from '../../features/expert-interpretation/constants/versions';
import { JOURNEY_MEMORY_VERSIONS } from '../../features/journey-memory/model/versions';
import { PRODUCT_STORAGE_VERSIONS } from '../../features/product-storage/constants';
import { NUMEROLOGY_SYSTEM } from '../../features/numerology/lib/numerology-engine';
import { ADVANCED_NUMEROLOGY_SYSTEM } from '../../features/numerology/advanced';
import { QualityAssertions } from '../assertions';
import { runBundleBoundaryGate } from '../architecture/bundle';
import { runArchitectureBoundaryGate, runForbiddenPatternsGate } from '../architecture/checks';
import { analyzeImportGraph } from '../architecture/import-graph';
import { runNumerologyRegressionGate } from '../determinism/numerology';
import { runTarotRegressionGate } from '../determinism/tarot';
import { QUALITY_BASELINE } from '../fixtures/baseline';
import { runPrivacyGate } from '../privacy';
import { runTarotArtworkGate } from '../regression/tarot-artwork';
import { runTarotPremiumProductionGate } from '../regression/tarot-premium-production';
import { runTarotRevealGate } from '../regression/tarot-reveal';
import { existingSuiteRunners, runPresentationAdapterGate } from '../runners/existing-suites';
import { runLocalizationGate } from '../runners/localization';
import { runSerializationGate } from '../serialization';
import type { QualityGateDefinition } from '../types';

function runCycleGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const graph = analyzeImportGraph(rootDir);
  graph.failures.forEach((failure) => assertions.assert(false, failure));
  graph.cycles.forEach((cycle) =>
    assertions.assert(false, {
      code: 'import-cycle',
      file: cycle[0],
      message: `Runtime import cycle detected: ${cycle.join(' -> ')}`,
      recommendation: 'Replace the barrel edge with a direct import or invert the dependency.',
    }),
  );
  assertions.assert(graph.moduleCount > 0, {
    code: 'empty-import-graph',
    message: 'No TypeScript modules were discovered for cycle analysis.',
  });
  return assertions.result();
}

function runBaselineGate() {
  const assertions = new QualityAssertions();
  const actual = {
    authorContent: EXPERT_INTERPRETATION_VERSIONS.content,
    chapterEngine: JOURNEY_MEMORY_VERSIONS.chapterEngine,
    expertInterpretation: EXPERT_INTERPRETATION_VERSIONS.engine,
    journeyMemory: JOURNEY_MEMORY_VERSIONS.engine,
    numerologyCalculation: NUMEROLOGY_SYSTEM,
    numerologyCycles: ADVANCED_NUMEROLOGY_SYSTEM,
    readingContinuity: 'reading-continuity-v1',
    productStorage: PRODUCT_STORAGE_VERSIONS.product,
    tarotRules: EXPERT_INTERPRETATION_VERSIONS.tarot,
    tarotArtwork: 'rws-classic-public-domain-v1',
    themeTracking: JOURNEY_MEMORY_VERSIONS.themeTracking,
    wording: EXPERT_INTERPRETATION_VERSIONS.wording,
    yearSummary: JOURNEY_MEMORY_VERSIONS.yearSummary,
  };
  Object.entries(QUALITY_BASELINE.moduleVersions).forEach(([key, expected]) =>
    assertions.assert(actual[key as keyof typeof actual] === expected, {
      actual: actual[key as keyof typeof actual],
      code: 'module-version-baseline',
      expected,
      message: `${key} version differs from the quality baseline.`,
    }),
  );
  return assertions.result({ moduleVersions: actual });
}

export const qualityGateRegistry: readonly QualityGateDefinition[] = [
  {
    affectedModules: ['expert-interpretation'],
    description: 'Fixtures, provider contract, confidence, versioning, and serialization.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.expertInterpretation,
    group: 'interpretation',
    id: 'expert-interpretation-runtime',
    required: true,
    runner: existingSuiteRunners.expertInterpretation,
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Interpretation',
  },
  {
    affectedModules: ['expert-interpretation/content'],
    description: 'Author content fixtures, claims, repetition, quality, and localization.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.authorContent,
    group: 'content',
    id: 'author-content-runtime',
    required: true,
    runner: existingSuiteRunners.authorContent,
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Content',
  },
  {
    affectedModules: ['tarot/expert-interpretation-adapter'],
    description: 'Compatibility adapter retains the current Tarot presentation contract.',
    group: 'regression',
    id: 'presentation-adapter-runtime',
    required: true,
    runner: runPresentationAdapterGate,
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Presentation Adapter',
  },
  {
    affectedModules: ['journey-memory'],
    description: 'Trends, chapters, milestones, year summaries, and serialization fixtures.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.journeyMemory,
    group: 'journey-memory',
    id: 'journey-memory-runtime',
    required: true,
    runner: existingSuiteRunners.journeyMemory,
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Journey Memory',
  },
  {
    affectedModules: ['journey-memory/continuity', 'expert-interpretation', 'product-storage'],
    description:
      'Relevant-history selection, cycle prevention, lineage, and Journey narrative activation.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.readingContinuity,
    group: 'journey-memory',
    id: 'reading-continuity-runtime',
    required: true,
    runner: existingSuiteRunners.readingContinuity,
    severity: 'error',
    tags: ['domain', 'storage', 'serialization', 'full'],
    timeout: 15_000,
    title: 'Reading Continuity',
  },
  {
    affectedModules: ['product-storage'],
    description: 'Migrations, checksums, transactions, recovery, import/export, and deletion.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.productStorage,
    group: 'product-storage',
    id: 'product-storage-runtime',
    required: true,
    runner: existingSuiteRunners.productStorage,
    severity: 'error',
    tags: ['storage', 'migration', 'serialization', 'full'],
    timeout: 15_000,
    title: 'Product Storage',
  },
  {
    affectedModules: ['product-storage/activation'],
    description: 'Bootstrap, fallback, dual-write, conflicts, multi-tab, and activation modes.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.storageActivation,
    group: 'storage-activation',
    id: 'storage-activation-runtime',
    required: true,
    runner: existingSuiteRunners.storageActivation,
    severity: 'error',
    tags: ['storage', 'migration', 'full'],
    timeout: 15_000,
    title: 'Storage Activation',
  },
  {
    affectedModules: ['tarot'],
    description: 'Deck, spreads, seeded selection, orientation, references, and meaning stability.',
    group: 'tarot',
    id: 'tarot-regression',
    required: true,
    runner: runTarotRegressionGate,
    severity: 'error',
    tags: ['domain', 'fast', 'full'],
    timeout: 15_000,
    title: 'Tarot',
  },
  {
    affectedModules: ['assets/tarot', 'tarot/components/TarotCardView'],
    description:
      'Classic RWS coverage, individual rights provenance, checksums, dimensions, budgets, loading, and fallback.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.tarotArtwork,
    group: 'tarot',
    id: 'tarot-artwork-rights',
    required: true,
    runner: ({ rootDir }) => runTarotArtworkGate(rootDir),
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Tarot Artwork',
  },
  {
    affectedModules: ['premium-production', 'scripts/premium-tarot'],
    description:
      'Production manifest, style lock, deterministic pilot prompts, approvals, release threshold, runtime isolation, and classic fallback.',
    group: 'tarot',
    id: 'tarot-premium-production',
    required: true,
    runner: ({ rootDir }) => runTarotPremiumProductionGate(rootDir),
    severity: 'error',
    tags: ['full'],
    timeout: 10_000,
    title: 'Tarot Production',
  },
  {
    affectedModules: ['tarot/flows/TarotReadingFlow', 'tarot/flows/reveal-state-machine'],
    description:
      'Bounded reveal timing, cleanup, skip, reduced motion, completion-once, and multi-card sequencing.',
    group: 'tarot',
    id: 'tarot-reveal-state-machine',
    required: true,
    runner: runTarotRevealGate,
    severity: 'error',
    tags: ['domain', 'fast', 'full'],
    timeout: 5_000,
    title: 'Tarot Reveal',
  },
  {
    affectedModules: ['numerology'],
    description: 'Date validation, traces, master numbers, periods, and Zodiac boundaries.',
    group: 'numerology',
    id: 'numerology-regression',
    required: true,
    runner: runNumerologyRegressionGate,
    severity: 'error',
    tags: ['domain', 'fast', 'full'],
    timeout: 10_000,
    title: 'Numerology',
  },
  {
    affectedModules: [
      'numerology/advanced',
      'numerology-knowledge',
      'cross-system-reasoning',
      'journey-memory',
      'product-storage',
    ],
    description:
      'Pinnacles, Challenges, Life Cycles, transitions, master policies, karmic provenance, and reference vectors.',
    expectedAssertionCount: QUALITY_BASELINE.assertions.numerologyAdvanced,
    group: 'numerology',
    id: 'numerology-advanced-runtime',
    required: true,
    runner: existingSuiteRunners.numerologyAdvanced,
    severity: 'error',
    tags: ['domain', 'storage', 'serialization', 'full'],
    timeout: 15_000,
    title: 'Numerology Advanced',
  },
  {
    affectedModules: ['expert-interpretation', 'journey-memory', 'product-storage'],
    description: 'JSON safety, canonical order, checksums, stable IDs, and round-trips.',
    group: 'serialization',
    id: 'serialization-regression',
    required: true,
    runner: runSerializationGate,
    severity: 'error',
    tags: ['domain', 'storage', 'full'],
    timeout: 15_000,
    title: 'Serialization',
  },
  {
    affectedModules: ['expert-interpretation/content', 'tarot/data'],
    description: 'RU/EN/UK structure, coverage, claims, and resolved templates.',
    group: 'content',
    id: 'localization-regression',
    required: true,
    runner: runLocalizationGate,
    severity: 'error',
    tags: ['domain', 'full'],
    timeout: 15_000,
    title: 'Localization',
  },
  {
    affectedModules: ['frontend/src'],
    description: 'Domain boundaries and controlled negative architecture fixtures.',
    group: 'architecture',
    id: 'architecture-boundaries',
    required: true,
    runner: ({ rootDir }) => runArchitectureBoundaryGate(rootDir),
    severity: 'fatal',
    tags: ['architecture', 'fast', 'full'],
    timeout: 15_000,
    title: 'Architecture',
  },
  {
    affectedModules: ['frontend/src'],
    description: 'Runtime import cycles and unresolved internal aliases.',
    group: 'architecture',
    id: 'import-cycle-detection',
    required: true,
    runner: ({ rootDir }) => runCycleGate(rootDir),
    severity: 'fatal',
    tags: ['architecture', 'full'],
    timeout: 20_000,
    title: 'Import Cycles',
  },
  {
    affectedModules: ['frontend/src'],
    description: 'Forbidden source patterns with explicit legacy allowlists.',
    group: 'architecture',
    id: 'forbidden-patterns',
    required: true,
    runner: ({ rootDir }) => runForbiddenPatternsGate(rootDir),
    severity: 'fatal',
    tags: ['architecture', 'fast', 'full'],
    timeout: 15_000,
    title: 'Forbidden Patterns',
  },
  {
    affectedModules: ['frontend/dist'],
    description: 'Production bundle size, route splitting, secrets, and test-module boundaries.',
    group: 'architecture',
    id: 'bundle-boundaries',
    required: true,
    runner: ({ rootDir }) => runBundleBoundaryGate(rootDir),
    severity: 'fatal',
    tags: ['architecture', 'fast', 'full'],
    timeout: 10_000,
    title: 'Bundle Boundaries',
  },
  {
    affectedModules: ['product-storage', 'voice-recording'],
    description: 'Persistent/export/logging boundaries exclude temporary and personal media data.',
    group: 'privacy',
    id: 'privacy-boundaries',
    required: true,
    runner: runPrivacyGate,
    severity: 'fatal',
    tags: ['architecture', 'storage', 'fast', 'full'],
    timeout: 10_000,
    title: 'Privacy',
  },
  {
    affectedModules: ['quality-gates'],
    description: 'Fixture counts, minimum assertions, module versions, deck and locale baselines.',
    group: 'regression',
    id: 'quality-baseline',
    required: true,
    runner: runBaselineGate,
    severity: 'fatal',
    tags: ['architecture', 'domain', 'storage', 'fast', 'full'],
    timeout: 5_000,
    title: 'Baseline',
  },
];
