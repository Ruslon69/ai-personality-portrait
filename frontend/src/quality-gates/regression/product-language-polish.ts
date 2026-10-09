import { journeyCopy, journeyPersistenceCopy, tarotHistoryCopy } from '../../features/journey/data';
import { numerologyCopy } from '../../features/numerology/data';
import { getTraitTemplate, traitOrder } from '../../features/personality-analysis/data';
import { recommendationSituations } from '../../features/personality-analysis/data/recommendation-context';
import { portraitJourneyCopy } from '../../features/personality-report/data/portrait-journey-copy';
import { reportCopy } from '../../features/personality-report/data/report-copy';
import { createGenerationStages } from '../../features/portrait-generation/config';
import { questionnaireCopy } from '../../features/questionnaire/data/questionnaire-copy';
import { standardTarotDeck, tarotCopy, tarotSpreadById } from '../../features/tarot/data';
import { cardActionCopy } from '../../features/tarot/data/card-action-copy';
import { cardMeaningCopy } from '../../features/tarot/data/card-meaning-copy';
import { createActiveCardGuidance } from '../../features/tarot/lib/interpretation-copy';
import { tarotPreferencesCopy } from '../../features/tarot/data/tarot-preferences-copy';
import { createEmptyDraftPortrait } from '../../entities/personality-profile';
import { localeDefinitions, supportedLocales, type Locale } from '../../shared/i18n';
import { productContractCopy } from '../../shared/i18n/product-contract-copy';
import { QualityAssertions } from '../assertions';
import { notificationMessage } from '../../app/providers/notification/notification-message';

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function copyStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(copyStrings);
}

export function runProductLanguagePolishGate() {
  const assertions = new QualityAssertions();
  let fixtureCount = 0;
  const check = (condition: unknown, code: string, message: string) =>
    assertions.assert(condition, { code, message });
  const notice = {
    id: 'locale-aware-notice',
    message: journeyPersistenceCopy.ru.saveFailed,
    resolveMessage: (locale: Locale) => journeyPersistenceCopy[locale].saveFailed,
    tone: 'error' as const,
  };
  const originalNotice = notice.message;
  for (const locale of supportedLocales) {
    fixtureCount += 1;
    check(
      notificationMessage(notice, locale) === journeyPersistenceCopy[locale].saveFailed &&
        notice.message === originalNotice,
      `notification-current-language-${locale}`,
      'Current-language notices must update without mutating their stored creation message.',
    );
    check(
      notificationMessage({ id: 'plain', message: 'plain notice', tone: 'info' }, locale) ===
        'plain notice',
      `notification-compatibility-${locale}`,
      'Plain-string notification callers must remain compatible.',
    );
  }
  const dictionaries: Record<string, Record<Locale, unknown>> = {
    tarot: tarotCopy,
    preferences: tarotPreferencesCopy,
    numerology: numerologyCopy,
    journey: journeyCopy,
    persistence: journeyPersistenceCopy,
    history: tarotHistoryCopy,
    report: reportCopy,
    portraitJourney: portraitJourneyCopy,
    questionnaire: questionnaireCopy,
    contracts: productContractCopy,
  };
  for (const [name, dictionary] of Object.entries(dictionaries)) {
    for (const locale of supportedLocales) {
      fixtureCount += 1;
      check(
        JSON.stringify(keys(dictionary[locale])) === JSON.stringify(keys(dictionary.ru)),
        `copy-coverage-${name}-${locale}`,
        'Every active language must cover the same interaction labels and nested keys.',
      );
      const foreignLetters =
        localeDefinitions[locale].script === 'latin'
          ? /[А-Яа-яЁёІіЇїЄєҐґ]/u
          : locale === 'uk'
            ? /[ыэъё]/iu
            : /[ІіЇїЄєҐґ]/u;
      check(
        copyStrings(dictionary[locale]).every((text) => !foreignLetters.test(text)),
        `copy-language-leak-${name}-${locale}`,
        'Static interface copy must not leak letters exclusive to another active language.',
      );
    }
  }
  for (const locale of supportedLocales) {
    fixtureCount += 1;
    check(
      new Intl.DateTimeFormat(localeDefinitions[locale].formatTag, { month: 'long' })
        .resolvedOptions()
        .locale.startsWith(locale),
      `format-registration-${locale}`,
      'Formatting metadata must resolve to the registered interface language.',
    );
    check(
      questionnaireCopy[locale].remaining(0).length > 0 &&
        !/\b0\b/u.test(questionnaireCopy[locale].remaining(0)),
      `final-question-${locale}`,
      'The last question must not announce zero remaining situations.',
    );
    check(
      !/1 (?:questions|situations)/u.test(questionnaireCopy[locale].remaining(1)),
      `one-question-${locale}`,
      'A single remaining question must use singular wording.',
    );
    for (const trait of traitOrder) {
      fixtureCount += 1;
      const situation = recommendationSituations[locale][trait];
      check(
        Boolean(situation) &&
          situation !== getTraitTemplate(trait, locale).recommendationDescription,
        `recommendation-situation-${locale}-${trait}`,
        'When-to-try content must add a situation rather than repeat the action.',
      );
    }
    for (const count of [1, 3, 6]) {
      fixtureCount += 1;
      const draft = createEmptyDraftPortrait();
      draft.interests = Array.from({ length: count }, (_, i) => `interest-${i}`);
      const stage = createGenerationStages(draft, locale).find((item) => item.id === 'interests');
      check(
        Boolean(stage?.activeTitle.includes(String(count))),
        `generation-count-${locale}-${count}`,
        'Generating must show the real selected-interest count without a missing label.',
      );
    }
  }
  check(
    Object.keys(cardActionCopy).length === standardTarotDeck.cards.length,
    'card-action-coverage',
    'There must be one editorial action per registered card identity.',
  );
  for (const locale of supportedLocales.filter(
    (value): value is Exclude<Locale, 'ru'> => value !== 'ru',
  )) {
    const actions = new Set<string>();
    for (const card of standardTarotDeck.cards) {
      fixtureCount += 1;
      const action = cardActionCopy[card.id]?.[locale];
      check(
        Boolean(action) && card.advice[locale] === action,
        `card-action-${locale}-${card.id}`,
        'The real reading must use the registered card-specific action without a generic fallback.',
      );
      actions.add(action);
    }
    check(
      actions.size === standardTarotDeck.cards.length,
      `card-action-diversity-${locale}`,
      'Different cards must not all repeat the same practical sentence.',
    );
  }
  const position = tarotSpreadById.get('week')!.positions[0]!;
  check(
    Object.keys(cardMeaningCopy).length === standardTarotDeck.cards.length,
    'card-meaning-coverage',
    'Every registered card must have its own meanings in all non-Russian editorial languages.',
  );
  for (const locale of supportedLocales.filter(
    (value): value is Exclude<Locale, 'ru'> => value !== 'ru',
  )) {
    for (const card of standardTarotDeck.cards) {
      for (const orientation of ['upright', 'reversed'] as const) {
        fixtureCount += 1;
        const meaning = cardMeaningCopy[card.id]?.[locale][orientation];
        check(
          Boolean(meaning) &&
            card[orientation][locale] === meaning &&
            ([undefined, 'love', 'work', 'money', 'decision'] as const).every((topic) =>
              createActiveCardGuidance({
                card,
                index: 0,
                locale,
                orientation,
                position,
                ...(topic ? { topic } : {}),
              }).meaning.includes(meaning),
            ),
          `card-meaning-${locale}-${card.id}-${orientation}`,
          'New readings must preserve the specific card meaning across orientation and topic.',
        );
      }
    }
  }
  check(
    /painful truth/u.test(cardMeaningCopy['swords-three']!.en.upright) &&
      /Болісну правду/u.test(cardMeaningCopy['swords-three']!.uk.upright),
    'three-swords-semantic-repair',
    'Three of Swords must describe painful truth, not the generic third-rank expansion.',
  );
  check(
    /easing/u.test(cardMeaningCopy['cups-five']!.en.reversed) &&
      /слабшати/u.test(cardMeaningCopy['cups-five']!.uk.reversed),
    'five-cups-reversed-semantic-repair',
    'Reversal must preserve the possibility of easing grief, not use one negative suit warning.',
  );
  check(
    createActiveCardGuidance({
      card: standardTarotDeck.cards.find((card) => card.id === 'swords-three')!,
      index: 0,
      locale: 'ru',
      orientation: 'upright',
      position,
    }).meaning.startsWith('Болезненную правду'),
    'russian-card-summary-content-first',
    'Collapsed reading summaries must show the card meaning before a repeated position label.',
  );
  return assertions.result({ fixtureCount });
}
