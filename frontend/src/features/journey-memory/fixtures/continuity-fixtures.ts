export type ReadingContinuityFixture = {
  expectedHistory: boolean;
  id: string;
  snapshotFixtureId: string;
};

const fixture = (
  id: string,
  snapshotFixtureId: string,
  expectedHistory = true,
): ReadingContinuityFixture => ({ expectedHistory, id, snapshotFixtureId });

export const readingContinuityFixtures: readonly ReadingContinuityFixture[] = [
  fixture('first-reading-without-history', 'empty-journey', false),
  fixture('second-unrelated-reading', 'two-unrelated', false),
  fixture('returning-theme', 'repeated-theme'),
  fixture('intensifying-theme', 'intensifying-theme'),
  fixture('fading-theme', 'fading-theme'),
  fixture('resolved-theme', 'resolved-theme'),
  fixture('repeated-major-arcana', 'repeated-major-arcana'),
  fixture('repeated-minor-card', 'repeated-suit'),
  fixture('repeated-suit-only', 'repeated-suit'),
  fixture('repeated-practical-focus', 'same-month-focus'),
  fixture('same-headline-unrelated-semantics', 'same-headline-different-theme', false),
  fixture('love-continuity', 'multiple-spreads-same-theme'),
  fixture('money-continuity', 'repeated-theme'),
  fixture('work-continuity', 'repeated-theme'),
  fixture('week-to-month-transition', 'personal-year-transition'),
  fixture('personal-year-transition', 'personal-year-transition'),
  fixture('master-number-11-continuity', 'master-number-11'),
  fixture('master-number-22-continuity', 'master-number-22'),
  fixture('master-number-33-continuity', 'master-number-33'),
  fixture('no-birth-date', 'repeated-theme'),
  fixture('no-psychological-context', 'repeated-theme'),
  fixture('empty-journey-memory', 'empty-journey', false),
  fixture('old-reading-without-versions', 'one-reading'),
  fixture('incompatible-versions', 'different-engine-versions', false),
  fixture('imported-legacy-reading', 'one-reading'),
  fixture('duplicate-reading-prevention', 'duplicate-serialized-entry'),
  fixture('multi-tab-conflict-resolved', 'repeated-theme'),
  fixture('multi-tab-conflict-unresolved', 'repeated-theme'),
  fixture('reading-deletion', 'two-unrelated'),
  fixture('export-round-trip', 'multi-year-journey'),
  fixture('import-merge', 'multi-year-journey'),
  fixture('storage-migration', 'one-reading'),
  fixture('snapshot-reused', 'repeated-theme'),
  fixture('snapshot-invalidated', 'repeated-theme'),
  fixture('current-reading-excluded', 'one-reading', false),
  fixture('same-input-determinism', 'intensifying-theme'),
  fixture('different-history-changes-journey-mode-only', 'intensifying-theme'),
  fixture('standard-mode-unaffected-by-irrelevant-history', 'two-unrelated', false),
] as const;
