import { sourcesCopy } from '../../features/personality-report/data/sources-copy';
import { confidenceCopy } from '../../features/personality-analysis/data/confidence-copy';
import { evidenceAssemblyCopy } from '../../features/personality-analysis/data/evidence-copy';
import { readingContextCopy } from '../../features/tarot/data/reading-context-copy';
import { numerologyLabels } from '../../features/numerology/data/numerology-labels';
import { resolve } from 'node:path';
import ts from 'typescript';
import { zodiacArtwork, westernSigns } from '../../assets/zodiac';
import { birthDateCopy } from '../../features/birth-date/data/birth-date-copy';
import { birthDateLensCopy } from '../../features/birth-date/data/birth-date-lens-copy';
import { journeyCopy, journeyPersistenceCopy, tarotHistoryCopy } from '../../features/journey/data';
import { numerologyCopy } from '../../features/numerology/data';
import { numberMeanings } from '../../features/numerology/data/number-meanings';
import { zodiacNotes } from '../../features/numerology/data/zodiac-copy';
import { getInterestLabel } from '../../features/personality-analysis/data';
import {
  completionCopy,
  sourceDetailsCopy,
  profileCopy,
} from '../../features/personality-analysis/data/profile-copy';
import { portraitAssemblyCopy } from '../../features/personality-analysis/data/portrait-assembly-copy';
import { createZodiacInterpretation } from '../../features/personality-analysis/lib/interpretations';
import { explanationCopy } from '../../features/personality-report/data/explanation-copy';
import { portraitJourneyCopy } from '../../features/personality-report/data/portrait-journey-copy';
import { reportCopy } from '../../features/personality-report/data/report-copy';
import { revealCopy } from '../../features/personality-report/data/reveal-copy';
import { summaryCopy } from '../../features/personality-report/data/summary-copy';
import { assemblyCopy } from '../../features/portrait-generation/data/assembly-copy';
import { generatingCopy } from '../../features/portrait-generation/data/generating-copy';
import { getPortraitQuestions } from '../../features/questionnaire/data/portraitQuestions';
import { questionnaireCopy } from '../../features/questionnaire/data/questionnaire-copy';
import { previewCopy } from '../../features/result-preview/data/preview-copy';
import { standardTarotDeck, tarotCopy, tarotSpreads } from '../../features/tarot/data';
import { tarotCardCountForms } from '../../features/tarot/data/card-count-copy';
import { tarotPreferencesCopy } from '../../features/tarot/data/tarot-preferences-copy';
import { userSettingsCopy } from '../../features/user-settings/data/user-settings-localization';
import { homeCopy } from '../../pages/home/home-copy';
import { privacyPolicyCopy, termsCopy } from '../../pages/legal/legal-copy';
import { routeCopy } from '../../router/route-copy';
import {
  fallbackLocale,
  formatDate,
  formatMessage,
  formatNumber,
  isSupportedLocale,
  localeDefinitions,
  localeOptions,
  messagesByLocale,
  normalizeLocale,
  pluralForm,
  resolveBrowserLocale,
  resolveLocale,
  supportedLocales,
  type Locale,
  type PluralForms,
} from '../../shared/i18n';
import { productContractCopy } from '../../shared/i18n/product-contract-copy';
import { QualityAssertions } from '../assertions';
import { projectPath, readSource, walkSourceFiles } from '../utils/source-files';

type Dictionary = Record<Locale, unknown>;
const dictionaries: Record<string, Dictionary> = {
  sourceSection: sourcesCopy,
  confidence: confidenceCopy,
  evidence: evidenceAssemblyCopy,
  readingContext: readingContextCopy,
  numerologyLabels,
  shell: messagesByLocale,
  home: homeCopy,
  route: routeCopy,
  birthDate: birthDateCopy,
  birthLens: birthDateLensCopy,
  preview: previewCopy,
  report: reportCopy,
  explanation: explanationCopy,
  reveal: revealCopy,
  summary: summaryCopy,
  portraitJourney: portraitJourneyCopy,
  generating: generatingCopy,
  assembly: assemblyCopy,
  questionnaire: questionnaireCopy,
  profile: profileCopy,
  completion: completionCopy,
  sources: sourceDetailsCopy,
  portraitAssembly: portraitAssemblyCopy,
  tarot: tarotCopy,
  tarotPreferences: tarotPreferencesCopy,
  numerology: numerologyCopy,
  numbers: numberMeanings,
  journey: journeyCopy,
  history: tarotHistoryCopy,
  persistence: journeyPersistenceCopy,
  contracts: productContractCopy,
  settings: userSettingsCopy,
  privacy: privacyPolicyCopy,
  terms: termsCopy,
};

function leaves(value: unknown, path = ''): Record<string, unknown> {
  if (!value || typeof value !== 'object') return { [path]: value };
  if (Array.isArray(value)) return { [path]: value };
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) =>
      Object.entries(leaves(child, path ? `${path}.${key}` : key)),
    ),
  );
}
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(strings);
}
function tokens(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/gu)].map((match) => match[1]!).sort();
}
function propertyName(node: ts.Node | undefined): string {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : '';
}
function unwrap(node: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  )
    return unwrap(node.expression);
  return node;
}
function shape(node: ts.Expression): string | null {
  const expression = unwrap(node);
  if (ts.isObjectLiteralExpression(expression)) {
    const entries = expression.properties.flatMap((property) =>
      ts.isPropertyAssignment(property)
        ? [`${propertyName(property.name)}:${shape(property.initializer) ?? 'reference'}`]
        : [],
    );
    return `{${entries.sort().join(',')}}`;
  }
  if (ts.isArrayLiteralExpression(expression)) return 'array';
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) return 'function';
  if (ts.isStringLiteralLike(expression) || ts.isTemplateExpression(expression)) return 'string';
  return null;
}

export function runLocalizationReadinessGate(rootDir: string) {
  const assertions = new QualityAssertions();
  let fixtureCount = 0;
  const check = (condition: unknown, code: string, message: string) =>
    assertions.assert(condition, { code, message });
  check(
    JSON.stringify(supportedLocales) === JSON.stringify(['ru', 'en', 'uk', 'es']),
    'enabled-languages',
    'Only the four approved production languages may be selectable.',
  );
  check(
    fallbackLocale === 'ru',
    'fallback-registration',
    'Unsupported browser preferences must use the documented Russian fallback.',
  );
  for (const unsupported of ['nl', 'de', 'pl', 'RU', 'en-US', '', undefined, null, 1]) {
    fixtureCount++;
    check(
      !isSupportedLocale(unsupported) && resolveLocale(unsupported) === fallbackLocale,
      'strict-locale-' + String(unsupported),
      'Persisted result-language IDs are strict; browser-language negotiation is separate.',
    );
  }
  check(
    normalizeLocale('EN-us') === 'en' &&
      normalizeLocale('es-MX') === 'es' &&
      resolveBrowserLocale(['fr-FR', 'uk-UA']) === 'uk',
    'browser-negotiation',
    'Browser regional tags must resolve to a supported language without enabling other languages.',
  );
  check(
    formatMessage('{count} {thing}', { count: 2 }, 'safe') === 'safe',
    'interpolation-failure',
    'Missing interpolation values must never leave raw tokens in the interface.',
  );
  check(
    formatMessage('{count} {thing}', { count: 0, thing: 'items' }) === '0 items',
    'interpolation-zero',
    'Zero is a valid interpolation value.',
  );
  for (const [name, dictionary] of Object.entries(dictionaries)) {
    const reference = leaves(dictionary[fallbackLocale]);
    const englishProse = new Set(
      strings(dictionary.en).filter(
        (value) => value.trim().split(/\s+/u).length > 2 && /[a-zA-Z]{3}/u.test(value),
      ),
    );
    check(
      strings(dictionary.es).every(
        (value) => !/[А-Яа-яЁёІіЇїЄєҐґ]/u.test(value) && !englishProse.has(value),
      ),
      'spanish-array-prose-' + name,
      'Spanish strings in nested arrays must not rely on Cyrillic or copied English fallback prose.',
    );
    for (const locale of supportedLocales) {
      fixtureCount++;
      const actual = leaves(dictionary[locale]);
      check(
        JSON.stringify(Object.keys(actual).sort()) ===
          JSON.stringify(Object.keys(reference).sort()),
        'dictionary-keys-' + name + '-' + locale,
        'Required content must have complete keys, with no orphaned translation keys.',
      );
      for (const [path, value] of Object.entries(actual)) {
        if (typeof value !== 'string') continue;
        check(
          Boolean(value.trim()),
          'empty-' + name + '-' + locale + '-' + path,
          'Required interface translations cannot be empty.',
        );
        if (locale === 'es' && value.split(/\s+/u).length > 2 && /[a-zA-Z]{3}/u.test(value))
          check(
            value !== leaves(dictionary.en)[path],
            'spanish-prose-' + name + '-' + path,
            'Spanish production prose must be authored, not copied from the English fallback.',
          );
        const baseline = reference[path];
        if (typeof baseline === 'string')
          check(
            JSON.stringify(tokens(value)) === JSON.stringify(tokens(baseline)),
            'tokens-' + name + '-' + locale + '-' + path,
            'All translations must preserve interpolation names.',
          );
        const foreignLetters =
          localeDefinitions[locale].script === 'latin'
            ? /[А-Яа-яЁёІіЇїЄєҐґ]/u
            : locale === 'uk'
              ? /[ыэъё]/iu
              : /[ІіЇїЄєҐґ]/u;
        check(
          !foreignLetters.test(value),
          'script-' + name + '-' + locale + '-' + path,
          'Static copy must not contain letters exclusive to another active language.',
        );
      }
    }
  }
  const zodiacDates = [
    '1990-04-01',
    '1990-05-01',
    '1990-06-01',
    '1990-07-01',
    '1990-08-01',
    '1990-09-01',
    '1990-10-01',
    '1990-11-01',
    '1990-12-01',
    '1990-01-01',
    '1990-02-01',
    '1990-03-01',
  ];
  for (const locale of supportedLocales) {
    fixtureCount++;
    check(
      localeOptions.some(
        (option) => option.locale === locale && option.htmlLang === locale && option.enabled,
      ),
      'selector-' + locale,
      'Selector and HTML language metadata must use the same registry.',
    );
    check(
      formatDate('2024-02-30', locale, undefined, 'invalid') === 'invalid' &&
        formatDate('broken', locale, undefined, 'invalid') === 'invalid',
      'invalid-date-' + locale,
      'Invalid dates must degrade without rolling into another calendar day.',
    );
    check(
      formatDate('2024-03-29', locale) ===
        new Intl.DateTimeFormat(localeDefinitions[locale].formatTag, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(2024, 2, 29)),
      'calendar-date-' + locale,
      'Calendar dates must not move with UTC parsing.',
    );
    check(
      formatNumber(1234.5, locale) ===
        new Intl.NumberFormat(localeDefinitions[locale].formatTag).format(1234.5),
      'numbers-' + locale,
      'Numbers use registered formatting metadata.',
    );
    for (const count of [0, 1, 2, 5, 11, 21, 22, 101]) {
      fixtureCount++;
      const category = new Intl.PluralRules(localeDefinitions[locale].formatTag).select(count);
      const forms: PluralForms = tarotCardCountForms[locale];
      check(
        pluralForm(count, locale, tarotCardCountForms[locale]) === (forms[category] ?? forms.other),
        'plural-' + locale + '-' + count,
        'Card counts must follow language-specific plural rules.',
      );
      check(
        !/\b1 (?:confirmed answers|selected interests)/u.test(
          completionCopy[locale].answersCount(count) + completionCopy[locale].interestsCount(count),
        ),
        'count-agreement-' + locale + '-' + count,
        'Single answers/interests must retain grammatical singular forms.',
      );
    }
    check(
      getInterestLabel('technology', locale) !== 'technology' || locale === 'en',
      'interest-display-' + locale,
      'Interest evidence must display the selected localized label, not an internal identifier.',
    );
    check(
      getInterestLabel('other:my own interest', locale) === 'my own interest',
      'custom-interest-' + locale,
      'User-entered interest content must not be translated or discarded.',
    );
    const questions = getPortraitQuestions(locale);
    const baseline = getPortraitQuestions(fallbackLocale);
    check(
      questions.length === 16,
      'question-count-' + locale,
      'All sixteen question paths must remain available.',
    );
    for (const [index, question] of questions.entries()) {
      fixtureCount++;
      check(
        question.id === baseline[index]?.id &&
          JSON.stringify(question.options?.map((option) => option.id)) ===
            JSON.stringify(baseline[index]?.options?.map((option) => option.id)),
        'answer-identity-' + locale + '-' + question.id,
        'Language changes must preserve answer IDs and their order.',
      );
      check(
        strings(question).every((value) => !/\{\w+\}|\bundefined\b/u.test(value)),
        'question-safe-' + locale + '-' + question.id,
        'Question content cannot leak interpolation placeholders.',
      );
    }
    check(
      new Set(Object.values(zodiacNotes[locale])).size === 12,
      'distinct-zodiac-' + locale,
      'Each Western sign needs its own semantic notes, not a generic substitute.',
    );
    for (const [index, sign] of westernSigns.entries()) {
      fixtureCount++;
      const insight = createZodiacInterpretation(zodiacDates[index]!, locale);
      check(
        insight.description.includes(zodiacNotes[locale][sign]),
        'zodiac-semantic-' + locale + '-' + sign,
        'Portrait symbolic context must preserve the same sign-specific qualities across languages.',
      );
      check(
        Boolean(zodiacArtwork.western[sign].descriptions[locale]),
        'zodiac-alt-' + locale + '-' + sign,
        'Meaningful artwork must have a localized accessible description.',
      );
    }
    for (const card of standardTarotDeck.cards) {
      fixtureCount++;
      const fields = [
        card.name,
        card.upright,
        card.reversed,
        card.advice,
        card.relationship,
        card.work,
        card.money,
        card.personalGrowth,
        card.caution,
      ];
      check(
        fields.every(
          (field) =>
            Boolean(field[locale]?.trim()) && !/\{\w+\}|\bundefined\b/u.test(field[locale]),
        ),
        'card-content-' + locale + '-' + card.id,
        'Every card must have complete localized meanings, guidance and context.',
      );
      check(
        card.upright[locale] !== card.reversed[locale],
        'orientation-' + locale + '-' + card.id,
        'Upright and reversed content must preserve a meaningful distinction.',
      );
    }
    for (const spread of tarotSpreads)
      for (const position of spread.positions) {
        fixtureCount++;
        check(
          Boolean(position.label[locale]?.trim()) && Boolean(position.prompt[locale]?.trim()),
          'spread-' + locale + '-' + position.id,
          'Every active spread position must be localized.',
        );
      }
  }
  // Syntax-level inspection is deliberately narrow: direct visible JSX and concrete locale objects.
  // Legacy Portrait History is not mounted by the current router; do not silently bless it for launch.
  const legacyPrefix = 'src/features/portrait-history/';
  for (const file of walkSourceFiles(resolve(rootDir, 'src'))) {
    const relative = projectPath(rootDir, file);
    if (relative.startsWith('src/quality-gates/') || /\/fixtures\/|\/tests\//u.test(relative))
      continue;
    const source = ts.createSourceFile(file, readSource(file), ts.ScriptTarget.Latest, true);
    const inspect = (node: ts.Node) => {
      if (ts.isObjectLiteralExpression(node)) {
        const properties = node.properties.filter(
          (property): property is ts.PropertyAssignment | ts.ShorthandPropertyAssignment =>
            ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property),
        );
        const locales = properties.filter((property) =>
          supportedLocales.includes(propertyName(property.name) as Locale),
        );
        if (locales.length >= 2) {
          fixtureCount++;
          const excludedRussianBase =
            locales.length === supportedLocales.length - 1 &&
            !locales.some((property) => propertyName(property.name) === 'ru') &&
            /Exclude<[^>]+,\s*'ru'>/u.test(source.text);
          check(
            excludedRussianBase || locales.length === supportedLocales.length,
            'source-locales-' + relative + '-' + node.pos,
            'Concrete localization maps must cover every active language (explicit Russian-base adapters excepted).',
          );
          const shapes = locales.map((property) =>
            ts.isPropertyAssignment(property) ? shape(property.initializer) : null,
          );
          if (
            !relative.endsWith('card-count-copy.ts') &&
            shapes.every((value) => value !== null && !value.includes('reference'))
          )
            check(
              new Set(shapes).size === 1,
              'source-shape-' + relative + '-' + node.pos,
              'Concrete locale objects must have matching nested key structures.',
            );
        }
      }
      let visible: string | undefined;
      if (ts.isJsxText(node)) visible = node.text.trim();
      if (
        ts.isJsxAttribute(node) &&
        ['aria-label', 'title', 'placeholder', 'alt'].includes(propertyName(node.name)) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      )
        visible = node.initializer.text;
      if (
        visible &&
        /\p{L}/u.test(visible) &&
        visible !== 'Soul Arkana' &&
        !relative.startsWith(legacyPrefix)
      ) {
        let decorative = false;
        for (let parent: ts.Node | undefined = node.parent; parent; parent = parent.parent) {
          const attributes = ts.isJsxElement(parent)
            ? parent.openingElement.attributes
            : ts.isJsxSelfClosingElement(parent)
              ? parent.attributes
              : undefined;
          if (
            attributes?.properties.some(
              (property) =>
                ts.isJsxAttribute(property) &&
                propertyName(property.name) === 'aria-hidden' &&
                property.initializer?.getText(source) === '"true"',
            )
          )
            decorative = true;
        }
        check(
          decorative,
          'hardcoded-jsx-' + relative + '-' + node.pos,
          'User-visible prose/accessible names must come from localized content, not direct JSX literals.',
        );
      }
      ts.forEachChild(node, inspect);
    };
    inspect(source);
  }
  return assertions.result({ fixtureCount });
}
