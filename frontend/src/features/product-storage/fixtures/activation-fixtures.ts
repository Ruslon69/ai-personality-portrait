export type ProductStorageActivationFixture = {
  expected: 'fallback' | 'primary' | 'recovered' | 'session-only';
  id: string;
  seed: string;
  timestamp: string;
};

export const ACTIVATION_FIXTURE_TIME = '2026-08-05T10:00:00.000Z';
export const ACTIVATION_FIXTURE_SEED = 'product-storage-activation-v1';

function fixture(
  id: string,
  expected: ProductStorageActivationFixture['expected'] = 'primary',
): ProductStorageActivationFixture {
  return {
    expected,
    id,
    seed: `${ACTIVATION_FIXTURE_SEED}:${id}`,
    timestamp: ACTIVATION_FIXTURE_TIME,
  };
}

export const productStorageActivationFixtures: readonly ProductStorageActivationFixture[] = [
  fixture('first-launch-empty'),
  fixture('first-launch-legacy-journey'),
  fixture('first-launch-legacy-tarot'),
  fixture('first-launch-mixed-legacy'),
  fixture('existing-valid-envelope'),
  fixture('existing-envelope-newer-legacy'),
  fixture('invalid-active-valid-backup', 'recovered'),
  fixture('interrupted-temporary-transaction', 'recovered'),
  fixture('corrupted-journey-section', 'recovered'),
  fixture('corrupted-tarot-section', 'recovered'),
  fixture('unsupported-future-envelope', 'fallback'),
  fixture('storage-unavailable', 'session-only'),
  fixture('quota-exceeded', 'session-only'),
  fixture('dual-write-success'),
  fixture('envelope-success-legacy-failure'),
  fixture('revision-conflict-resolved'),
  fixture('revision-conflict-unresolved', 'fallback'),
  fixture('multi-tab-external-change'),
  fixture('external-older-revision-ignored'),
  fixture('journey-memory-reuse'),
  fixture('journey-memory-rebuild'),
  fixture('import-preview'),
  fixture('import-merge'),
  fixture('import-replace-with-backup'),
  fixture('delete-tarot'),
  fixture('delete-journey'),
  fixture('delete-all-keep-preferences'),
  fixture('feature-flag-disabled', 'fallback'),
  fixture('theme-locale-legacy-preserved'),
  fixture('session-only-tarot-not-persisted', 'session-only'),
  fixture('repeated-bootstrap-idempotent'),
  fixture('recovery-after-partial-transaction', 'recovered'),
] as const;
