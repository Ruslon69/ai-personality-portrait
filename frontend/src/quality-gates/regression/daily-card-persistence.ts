import { createStore } from '../../store';
import {
  createDailyCard,
  createTarotHistorySnapshot,
  getLocalDateKey,
} from '../../features/journey/lib';
import { normalizeDailyCards } from '../../features/journey/lib/normalize-daily-cards';
import { createJourneyActions } from '../../features/journey/model/journey-store';
import type { JourneyState } from '../../features/journey/types';
import { buildJourneyMemorySnapshot } from '../../features/journey-memory/model';
import { journeyStateToMemorySources } from '../../features/journey-memory/normalization';
import { validateJourneyMemorySnapshot } from '../../features/journey-memory/validation';
import { stableStringify } from '../../features/journey-memory/utils';
import { createNumerologyProfile } from '../../features/numerology/lib';
import { standardTarotDeck, tarotSpreads } from '../../features/tarot/data';
import { createAutomaticSelections, createTarotReading } from '../../features/tarot/lib';
import { journeyStorageAdapter } from '../../features/product-storage/adapters';
import { restoreDailyCardState } from '../../features/product-storage/adapters/journey-adapter';
import {
  BrowserProductStorageLegacyBridge,
  InMemoryProductStorageLegacyBridge,
} from '../../features/product-storage/compatibility';
import { LEGACY_STORAGE_KEYS } from '../../features/product-storage/constants';
import {
  BrowserProductStorageRepository,
  InMemoryProductStorageRepository,
} from '../../features/product-storage/repositories';
import { didJourneyWritePersist } from '../../features/product-storage/runtime/browser-runtime';
import { ProductStorageService } from '../../features/product-storage/service';
import type { QualityAssertions } from '../assertions';

const now = '2026-09-20T10:00:00.000Z';

class DailyQuotaStorage implements Storage {
  private values = new Map<string, string>();
  envelopeQuota = false;
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.envelopeQuota && key.startsWith('app:product-storage-v2'))
      throw new DOMException('Envelope exceeds quota', 'QuotaExceededError');
    this.values.set(key, value);
  }
}

// Real reading inputs that previously collided in card-number resonance IDs.
function historicalReadings(): JourneyState['readings'] {
  return ['week', 'month', 'year'].map((spreadId, index) => {
    const spread = tarotSpreads.find((item) => item.id === spreadId)!;
    const createdAt = new Date(Date.UTC(2026, 8, 19 - index, 10)).toISOString();
    const seed = `profile-qa-${index}`;
    const reading = createTarotReading(
      {
        birthDate: '1994-06-17',
        deckTheme: 'cosmic-minimal',
        interests: [],
        locale: 'ru',
        numerology: createNumerologyProfile('1994-06-17', 'ru', new Date(createdAt)),
        period: spread.period,
        psychologyAnswers: [],
        seed,
        selectionMode: 'automatic',
        spreadId: spread.id,
      },
      createAutomaticSelections(standardTarotDeck.cards, spread, seed),
      createdAt,
    );
    return {
      favorite: false,
      reading,
      savedAt: createdAt,
      snapshot: createTarotHistorySnapshot(reading),
    };
  });
}

export function checkDailyCardPersistence(assertions: QualityAssertions) {
  const history = historicalReadings();
  const originalHistory = JSON.stringify(history);
  const initial: JourneyState = {
    identity: 'daily-persistence',
    dailyCards: {},
    readings: history,
  };
  const memory = buildJourneyMemorySnapshot({
    generatedAt: now,
    locale: 'ru',
    sources: journeyStateToMemorySources(initial),
  });
  const resonances = memory.numberPatterns.filter(
    (pattern) => pattern.kind === 'card-number-resonance',
  );
  assertions.assert(
    resonances.length > 1 &&
      memory.validation.valid &&
      new Set(memory.numberPatterns.map((pattern) => pattern.id)).size ===
        memory.numberPatterns.length,
    {
      code: 'daily-memory-distinct-calculation-ids',
      message:
        'Different calculations sharing a card number must not block persistence with duplicate IDs.',
    },
  );
  assertions.assert(
    !validateJourneyMemorySnapshot({
      ...memory,
      numberPatterns: [...memory.numberPatterns, resonances[0]!],
    }).valid,
    {
      code: 'daily-memory-duplicate-validation-preserved',
      message: 'The duplicate-ID validator must remain strict.',
    },
  );

  for (const enabled of [false, true]) {
    for (const readings of [[], history]) {
      const repository = new InMemoryProductStorageRepository();
      const legacy = new InMemoryProductStorageLegacyBridge();
      const options = {
        diagnostics: { emit: () => undefined },
        featureFlag: { enabled, name: 'productStorageV2' as const, source: 'environment' as const },
        legacy,
        locale: 'ru' as const,
        mode: 'envelope-primary' as const,
        now: () => now,
        productVersion: 'daily-persistence-regression',
        repository,
      };
      const service = new ProductStorageService(options);
      service.bootstrap();
      const store = createStore<JourneyState>({ ...initial, readings });
      const actions = createJourneyActions(store, {
        historyLimit: () => 75,
        now: () => now,
        persist(state) {
          const write = service.updateSection(
            'journey',
            journeyStorageAdapter.toEnvelopeSection(state)!,
          );
          return { persisted: didJourneyWritePersist(write, service.getCapability()) };
        },
      });
      const today = createDailyCard(initial.identity, '2026-09-20');
      const ensured = actions.ensureDailyCard(today);
      const opened = actions.openDailyCard(today.dateKey);
      const saved = JSON.stringify(store.getState());
      const operations = repository.operations.length + legacy.operations.length;
      actions.ensureDailyCard(today);
      actions.openDailyCard(today.dateKey);
      const repeatIsNoop = operations === repository.operations.length + legacy.operations.length;
      service.dispose();
      const reloaded = new ProductStorageService(options);
      reloaded.bootstrap();
      const restored =
        journeyStorageAdapter.fromEnvelope(reloaded.getSection('journey') ?? undefined) ??
        journeyStorageAdapter.legacyFallback(
          legacy.readValues(LEGACY_STORAGE_KEYS.journey)[LEGACY_STORAGE_KEYS.journey[0]] ?? null,
        );
      assertions.assert(
        ensured.persisted &&
          opened.persisted &&
          repeatIsNoop &&
          stableStringify(restored?.dailyCards) === stableStringify(store.getState().dailyCards) &&
          stableStringify(restored?.readings) === stableStringify(readings) &&
          saved === JSON.stringify(store.getState()),
        {
          code: `daily-storage-lifecycle-${enabled}-${readings.length}`,
          message:
            'Daily Card must persist, reload and reopen idempotently in legacy and envelope storage without changing historical snapshots.',
        },
      );
      reloaded.dispose();
      // Reuse the same persistence boundary after returning to the page.
      const nextService = new ProductStorageService(options);
      nextService.bootstrap();
      const nextStore = createStore(restored!);
      const nextActions = createJourneyActions(nextStore, {
        historyLimit: () => 75,
        now: () => '2026-09-21T00:10:00.000Z',
        persist(state) {
          const write = nextService.updateSection(
            'journey',
            journeyStorageAdapter.toEnvelopeSection(state)!,
          );
          return { persisted: didJourneyWritePersist(write, nextService.getCapability()) };
        },
      });
      const next = createDailyCard(initial.identity, '2026-09-21');
      nextActions.ensureDailyCard(next);
      const nextOpened = nextActions.openDailyCard(next.dateKey);
      assertions.assert(
        nextOpened.persisted &&
          Object.keys(nextStore.getState().dailyCards).length === 2 &&
          JSON.stringify(nextStore.getState().dailyCards[today.dateKey]) ===
            JSON.stringify(restored?.dailyCards[today.dateKey]) &&
          stableStringify(nextStore.getState().readings) === stableStringify(readings),
        {
          code: `daily-next-local-day-${enabled}-${readings.length}`,
          message:
            'A new local day must add its own card without replacing yesterday or changing readings.',
        },
      );
      nextService.dispose();
    }
  }

  const today = createDailyCard(initial.identity, '2026-09-20');
  const valid = { ...today, openedAt: now };
  const storage = new DailyQuotaStorage();
  const legacyBridge = new BrowserProductStorageLegacyBridge(storage, storage);
  const quotaOptions = {
    diagnostics: { emit: () => undefined },
    featureFlag: {
      enabled: true,
      name: 'productStorageV2' as const,
      source: 'environment' as const,
    },
    legacy: legacyBridge,
    locale: 'ru' as const,
    mode: 'envelope-primary' as const,
    now: () => now,
    productVersion: 'daily-quota-regression',
  };
  const quotaService = new ProductStorageService({
    ...quotaOptions,
    repository: new BrowserProductStorageRepository(storage),
  });
  quotaService.bootstrap();
  quotaService.updateSection(
    'journey',
    journeyStorageAdapter.toEnvelopeSection({
      ...initial,
      dailyCards: { [today.dateKey]: today },
    })!,
  );
  storage.envelopeQuota = true;
  const quotaWrite = quotaService.updateSection(
    'journey',
    journeyStorageAdapter.toEnvelopeSection({
      ...initial,
      dailyCards: { [today.dateKey]: valid },
    })!,
  );
  quotaService.dispose();
  storage.envelopeQuota = false;
  const quotaReload = new ProductStorageService({
    ...quotaOptions,
    repository: new BrowserProductStorageRepository(storage),
  });
  quotaReload.bootstrap();
  const oldEnvelope = journeyStorageAdapter.fromEnvelope(
    quotaReload.getSection('journey') ?? undefined,
  );
  const savedLegacy = journeyStorageAdapter.legacyFallback(
    storage.getItem(LEGACY_STORAGE_KEYS.journey[0]),
  );
  const restoredDaily = restoreDailyCardState(oldEnvelope, savedLegacy);
  assertions.assert(
    quotaWrite.legacyWritten &&
      oldEnvelope?.dailyCards[today.dateKey]?.openedAt === null &&
      restoredDaily?.dailyCards[today.dateKey]?.openedAt === now &&
      stableStringify(restoredDaily.readings) === stableStringify(oldEnvelope.readings) &&
      stableStringify(restoredDaily.readings) === stableStringify(history),
    {
      code: 'daily-quota-legacy-open-survives-reload',
      message:
        'When envelope writes fall back to memory, the successful durable legacy open must survive reload without replacing authoritative historical readings.',
    },
  );
  assertions.assert(
    restoreDailyCardState(oldEnvelope, { ...savedLegacy!, identity: 'other-browser' }) ===
      oldEnvelope &&
      restoreDailyCardState(oldEnvelope, {
        ...savedLegacy!,
        dailyCards: {
          [today.dateKey]: {
            ...valid,
            selection: {
              ...valid.selection,
              orientation: today.selection.orientation === 'upright' ? 'reversed' : 'upright',
            },
          },
        },
      })?.dailyCards[today.dateKey]?.openedAt === null,
    {
      code: 'daily-fallback-identity-and-selection-bound',
      message:
        'Legacy open state must never be applied to another identity or a different card selection.',
    },
  );
  quotaReload.dispose();
  const recovered = normalizeDailyCards({
    '2026-09-20': valid,
    '2026-09-21': {
      ...today,
      dateKey: '2026-09-21',
      selection: { ...today.selection, cardId: 'unknown' },
    },
    '2026-09-22': { ...today, dateKey: '2026-09-22', openedAt: 'broken' },
    '2026-09-23': { ...today, dateKey: '2026-09-23', selection: null },
    '2026-02-30': { ...today, dateKey: '2026-02-30' },
  });
  assertions.assert(
    JSON.stringify(recovered['2026-09-20']) === JSON.stringify(valid) &&
      !recovered['2026-09-21'] &&
      !recovered['2026-09-23'] &&
      !recovered['2026-02-30'] &&
      recovered['2026-09-22']?.openedAt === null &&
      recovered['2026-09-22']?.selection.cardId === today.selection.cardId &&
      Object.keys(normalizeDailyCards(null)).length === 0 &&
      getLocalDateKey(new Date(2026, 8, 20, 23, 59)) === '2026-09-20' &&
      getLocalDateKey(new Date(2026, 8, 21, 0, 0)) === '2026-09-21',
    {
      code: 'daily-corrupt-entry-recovery',
      message:
        'Invalid Daily Card entries must recover independently, preserving valid cards and the local calendar boundary.',
    },
  );
  const store = createStore<JourneyState>({ ...initial, dailyCards: { [today.dateKey]: today } });
  const corruptMap = journeyStorageAdapter.legacyFallback(
    JSON.stringify({ ...initial, dailyCards: null }),
  );
  assertions.assert(
    corruptMap !== null &&
      Object.keys(corruptMap.dailyCards).length === 0 &&
      JSON.stringify(corruptMap.readings) === originalHistory,
    {
      code: 'daily-corrupt-map-preserves-history',
      message: 'A damaged Daily Card map must not discard the independent saved reading history.',
    },
  );
  let available = false;
  const actions = createJourneyActions(store, {
    historyLimit: () => 75,
    now: () => now,
    persist: () => ({ persisted: available }),
  });
  const failed = actions.openDailyCard(today.dateKey);
  const rolledBack = store.getState().dailyCards[today.dateKey]?.openedAt === null;
  available = true;
  const retried = actions.openDailyCard(today.dateKey);
  assertions.assert(
    !failed.persisted &&
      rolledBack &&
      retried.persisted &&
      store.getState().dailyCards[today.dateKey]?.openedAt === now &&
      JSON.stringify(history) === originalHistory,
    {
      code: 'daily-real-failure-retry',
      message:
        'A real write failure must remain observable, roll back the open state and allow retry without mutating history.',
    },
  );
}
