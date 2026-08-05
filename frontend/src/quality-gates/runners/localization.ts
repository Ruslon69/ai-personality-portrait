import { classifyUnsafeClaims } from '../../features/expert-interpretation/content/safeguards';
import { contentDictionaries } from '../../features/expert-interpretation/content/localization';
import { interpretationFixtures } from '../../features/expert-interpretation/fixtures/fixtures';
import { localExpertInterpretationProvider } from '../../features/expert-interpretation/providers';
import { standardTarotDeck, tarotSpreads } from '../../features/tarot/data';
import { QualityAssertions } from '../assertions';
import { negativeQualityFixtures } from '../fixtures/negative-fixtures';
import { QUALITY_BASELINE } from '../fixtures/baseline';

function structure(value: unknown): unknown {
  if (Array.isArray(value)) return ['array'];
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, structure(child)]),
    );
  return typeof value;
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object')
    return Object.values(value as Record<string, unknown>).flatMap(allStrings);
  return [];
}

export function runLocalizationGate() {
  const assertions = new QualityAssertions();
  const dictionaryStructures = QUALITY_BASELINE.locales.map((locale) =>
    JSON.stringify(structure(contentDictionaries[locale])),
  );
  assertions.assert(new Set(dictionaryStructures).size === 1, {
    code: 'content-dictionary-structure',
    message: 'RU, EN, and UK content dictionaries do not share the same structure.',
  });
  QUALITY_BASELINE.locales.forEach((locale) => {
    const dictionaryText = allStrings(contentDictionaries[locale]).join(' ');
    assertions.assert(
      allStrings(contentDictionaries[locale]).every((text) => text.trim().length > 0),
      {
        code: 'empty-content-localization',
        message: `${locale} content dictionary contains an empty string.`,
      },
    );
    assertions.assert(classifyUnsafeClaims(dictionaryText).length === 0, {
      code: 'unsafe-content-resource-claim',
      message: `${locale} content resources contain a forbidden claim.`,
    });
    assertions.assert(
      !/\bAI\b|artificial intelligence|искусственн(?:ый|ого) интеллект|штучн(?:ий|ого) інтелект|professional tarot reader|профессиональн(?:ый|ого) таролог|професійн(?:ий|ого) таролог/iu.test(
        dictionaryText,
      ),
      {
        code: 'forbidden-content-resource-term',
        message: `${locale} content resources contain an AI or real-specialist claim.`,
      },
    );
  });
  const results = interpretationFixtures.map(
    (fixture) => localExpertInterpretationProvider.interpret(fixture.request).result,
  );
  QUALITY_BASELINE.locales.forEach((locale) =>
    assertions.assert(
      results.some((result) => result.content.locale === locale),
      {
        code: 'missing-generated-locale',
        message: `No authored interpretation fixture covers ${locale}.`,
      },
    ),
  );
  results.forEach((result) => {
    const authored = JSON.stringify(result.content);
    assertions.assert(
      allStrings(result.content).every((text) => !/\{\{?[^{}]+\}\}?/.test(text)),
      {
        code: 'unresolved-content-variable',
        message: `${result.id} contains an unresolved template variable.`,
      },
    );
    assertions.assert(classifyUnsafeClaims(authored).length === 0, {
      code: 'unsafe-localized-claim',
      message: `${result.id} contains a forbidden user-facing claim.`,
    });
    assertions.assert(
      !/\bAI\b|artificial intelligence|искусственн(?:ый|ого) интеллект|штучн(?:ий|ого) інтелект|professional tarot reader|профессиональн(?:ый|ого) таролог|професійн(?:ий|ого) таролог/iu.test(
        authored,
      ),
      {
        code: 'forbidden-product-claim',
        message: `${result.id} contains an AI or real-specialist claim.`,
      },
    );
    if (result.content.locale === 'en')
      assertions.assert(!/[А-Яа-яЁёІіЇїЄєҐґ]/u.test(authored), {
        code: 'mixed-en-locale',
        message: `${result.id} mixes Cyrillic content into English output.`,
      });
    else
      assertions.assert(/[А-Яа-яЁёІіЇїЄєҐґ]/u.test(authored), {
        code: 'missing-cyrillic-locale-content',
        message: `${result.id} lacks expected Cyrillic localized content.`,
      });
  });
  standardTarotDeck.cards.forEach((card) =>
    QUALITY_BASELINE.locales.forEach((locale) =>
      assertions.assert(Boolean(card.name[locale]?.trim()), {
        code: 'missing-card-name-localization',
        message: `${card.id} has no ${locale} name.`,
      }),
    ),
  );
  tarotSpreads.forEach((spread) =>
    QUALITY_BASELINE.locales.forEach((locale) =>
      assertions.assert(
        Boolean(spread.title[locale]?.trim()) &&
          spread.positions.every((position) => Boolean(position.label[locale]?.trim())),
        {
          code: 'missing-spread-localization',
          message: `${spread.id} has incomplete ${locale} title or position labels.`,
        },
      ),
    ),
  );
  assertions.assert(classifyUnsafeClaims(negativeQualityFixtures.forbiddenClaim).length > 0, {
    code: 'negative-claim-not-detected',
    message: 'Controlled forbidden claim was not rejected.',
  });
  assertions.assert(/\{\{?[^{}]+\}\}?/.test(negativeQualityFixtures.unresolvedTemplate), {
    code: 'negative-variable-not-detected',
    message: 'Controlled unresolved variable was not rejected.',
  });
  return assertions.result({
    moduleVersions: {
      authorContent: QUALITY_BASELINE.moduleVersions.authorContent,
      wording: QUALITY_BASELINE.moduleVersions.wording,
    },
  });
}
