import { countWords } from '../content/grammar';
import { MIN_CONTENT_QUALITY_SCORE } from '../content/quality';
import { classifyUnsafeClaims, replaceUnsafeClaims } from '../content/safeguards';
import { contentDictionaries } from '../content/localization';
import { deserializeInterpretationResult, serializeInterpretationResult } from '../model';
import { LocalExpertInterpretationProvider } from '../providers';
import type {
  AuthorInterpretationContent,
  InterpretationRequest,
  InterpretationResult,
} from '../types';
import { stableStringify } from '../utils';
import { interpretationFixtures } from './fixtures';

export type ContentRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  suites: Readonly<Record<'claims' | 'content' | 'localization' | 'repetition', boolean>>;
  valid: boolean;
};

type Assert = (condition: boolean, message: string) => void;

function allContentTexts(content: AuthorInterpretationContent) {
  return [
    content.headline,
    content.opening,
    content.closing,
    ...content.sections.flatMap((section) => [
      section.headline,
      section.opening ?? '',
      ...section.blocks.map((block) => block.text),
    ]),
  ].filter(Boolean);
}

function runClaimChecks(results: readonly InterpretationResult[], assert: Assert) {
  const unsafeSamples = [
    'Это обязательно произойдёт',
    'У тебя диагноз',
    'Юридически тебе следует подписать документ',
    'Этот выбор гарантирует доход',
    'Он точно думает о встрече',
    'Вы обязательно расстанетесь',
    'Ты точно беременна',
    'Ты умрёшь',
    'Ты точно выиграешь',
    'Событие произойдёт 12/10',
    'Профессиональный таролог провёл анализ',
  ];
  unsafeSamples.forEach((sample) =>
    assert(classifyUnsafeClaims(sample).length > 0, `Claim classifier missed: ${sample}`),
  );
  results.forEach((result) =>
    assert(
      allContentTexts(result.content).every((text) => classifyUnsafeClaims(text).length === 0),
      `${result.id}: generated content contains a banned claim.`,
    ),
  );
  const source = results[0];
  if (source) {
    const unsafe = { ...source.content, closing: unsafeSamples[0] ?? '' };
    const replaced = replaceUnsafeClaims(unsafe, contentDictionaries[source.content.locale]);
    assert(replaced.replacements.length === 1, 'Unsafe content was not replaced exactly once.');
    assert(
      classifyUnsafeClaims(replaced.content.closing).length === 0,
      'Unsafe replacement still contains a banned claim.',
    );
  }
}

function runLocalizationChecks(results: readonly InterpretationResult[], assert: Assert) {
  const byLocale = new Map(results.map((result) => [result.content.locale, result]));
  assert(
    ['ru', 'en', 'uk'].every((locale) => byLocale.has(locale as 'en')),
    'Not all locales are covered.',
  );
  results.forEach((result) => {
    const text = allContentTexts(result.content).join(' ');
    if (result.content.locale === 'en') {
      assert(!/[А-Яа-яЁёІіЇїЄєҐґ]/u.test(text), `${result.id}: English content contains Cyrillic.`);
    } else {
      assert(
        /[А-Яа-яЁёІіЇїЄєҐґ]/u.test(text),
        `${result.id}: Cyrillic locale has no Cyrillic content.`,
      );
    }
    if (result.content.locale === 'ru') {
      assert(
        !/[ІіЇїЄєҐґ]/u.test(text),
        `${result.id}: Russian content contains Ukrainian letters.`,
      );
    }
  });
  const baseFixture = interpretationFixtures.find((fixture) => fixture.id === 'card-day-with-date');
  if (baseFixture) {
    const provider = new LocalExpertInterpretationProvider();
    const outputs = (['ru', 'en', 'uk'] as const).map(
      (locale) => provider.interpret({ ...baseFixture.request, locale }).result.content,
    );
    assert(
      new Set(outputs.map((output) => output.headline)).size === 3,
      'Changing locale did not change the authored headline.',
    );
    assert(
      outputs.every((output) => output.quality.valid),
      'A locale variant failed quality checks.',
    );
  }
}

function runRepetitionChecks(results: readonly InterpretationResult[], assert: Assert) {
  results.forEach((result) => {
    const headlines = result.content.sections.map((section) =>
      section.headline.toLocaleLowerCase(),
    );
    assert(
      new Set(headlines).size === headlines.length,
      `${result.id}: duplicate section headline.`,
    );
    const practical = result.content.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === 'practical-focus')
      .map((block) => block.text.toLocaleLowerCase());
    assert(
      new Set(practical).size === practical.length,
      `${result.id}: duplicate practical focus.`,
    );
    const text = allContentTexts(result.content).join(' ').toLocaleLowerCase();
    [
      'обратить внимание',
      'может указывать',
      'pay attention',
      'may indicate',
      'звернути увагу',
      'може вказувати',
    ].forEach((phrase) =>
      assert(
        text.split(phrase).length - 1 <= 2,
        `${result.id}: phrase “${phrase}” is repeated excessively.`,
      ),
    );
    assert(
      result.content.quality.score.repetition >= 68,
      `${result.id}: repetition score is too low.`,
    );
  });
}

function cardPositionText(result: InterpretationResult) {
  return result.content.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === 'card-position-meaning')?.text;
}

function practicalText(result: InterpretationResult) {
  return result.content.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === 'practical-focus')?.text;
}

function runContentChecks(results: readonly InterpretationResult[], assert: Assert) {
  const provider = new LocalExpertInterpretationProvider();
  const strategies = new Set(results.map((result) => result.content.narrativeStrategy));
  [
    'card-of-the-day',
    'week',
    'month',
    'compact-year',
    'love',
    'work-study',
    'money',
    'decision',
  ].forEach((strategy) =>
    assert(strategies.has(strategy), `Narrative strategy ${strategy} is not covered.`),
  );
  results.forEach((result) => {
    assert(result.content.quality.valid, `${result.id}: content quality report is invalid.`);
    assert(
      result.content.quality.score.overall >= MIN_CONTENT_QUALITY_SCORE,
      `${result.id}: content quality threshold was not met.`,
    );
    assert(
      countWords(result.content.headline) >= 5 && countWords(result.content.headline) <= 12,
      `${result.id}: headline length is outside 5–12 words.`,
    );
    assert(
      result.content.sections.every(
        (section) =>
          section.blocks.length > 0 && section.blocks.every((block) => block.text.trim()),
      ),
      `${result.id}: empty authored section.`,
    );
    assert(
      stableStringify(deserializeInterpretationResult(serializeInterpretationResult(result))) ===
        stableStringify(result),
      `${result.id}: authored content failed JSON round-trip.`,
    );
  });

  const day = interpretationFixtures.find((fixture) => fixture.id === 'card-day-with-date');
  if (day) {
    const reversedRequest: InterpretationRequest = {
      ...day.request,
      tarot: {
        ...day.request.tarot,
        cards: day.request.tarot.cards.map((card) => ({ ...card, orientation: 'reversed' })),
      },
    };
    const upright = provider.interpret(day.request).result;
    const reversed = provider.interpret(reversedRequest).result;
    assert(
      cardPositionText(upright) !== cardPositionText(reversed),
      'Reversed orientation did not change semantic wording.',
    );

    const support = {
      ...day.request,
      tarot: {
        ...day.request.tarot,
        cards: day.request.tarot.cards.map((card) => ({ ...card, positionId: 'week-support' })),
      },
    };
    const obstacle = {
      ...day.request,
      tarot: {
        ...day.request.tarot,
        cards: day.request.tarot.cards.map((card) => ({ ...card, positionId: 'week-obstacle' })),
      },
    };
    assert(
      cardPositionText(provider.interpret(support).result) !==
        cardPositionText(provider.interpret(obstacle).result),
      'Changing spread position did not change card emphasis.',
    );
  }

  const work = interpretationFixtures.find((fixture) => fixture.id === 'work-study-spread');
  if (work) {
    const moneyRequest: InterpretationRequest = {
      ...work.request,
      tarot: { ...work.request.tarot, spreadId: 'money', topic: 'money' },
    };
    const workResult = provider.interpret(work.request).result;
    const moneyResult = provider.interpret(moneyRequest).result;
    assert(
      workResult.content.narrativeStrategy !== moneyResult.content.narrativeStrategy &&
        practicalText(workResult) !== practicalText(moneyResult),
      'Changing topic did not change narrative structure and practical focus.',
    );
    const otherDeck = {
      ...work.request,
      tarot: { ...work.request.tarot, deckTheme: 'vintage' },
    };
    assert(
      stableStringify(workResult.content) ===
        stableStringify(provider.interpret(otherDeck).result.content),
      'Deck theme changed authored wording.',
    );
  }
}

export function runAuthorContentRuntimeSuite(): ContentRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert: Assert = (condition, message) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const provider = new LocalExpertInterpretationProvider();
  const results = interpretationFixtures.map(
    (fixture) => provider.interpret(fixture.request).result,
  );
  const before = errors.length;
  runClaimChecks(results, assert);
  const claims = errors.length === before;
  const localizationBefore = errors.length;
  runLocalizationChecks(results, assert);
  const localization = errors.length === localizationBefore;
  const repetitionBefore = errors.length;
  runRepetitionChecks(results, assert);
  const repetition = errors.length === repetitionBefore;
  const contentBefore = errors.length;
  runContentChecks(results, assert);
  const content = errors.length === contentBefore;
  return {
    assertionCount,
    errors,
    fixtureCount: interpretationFixtures.length,
    suites: { claims, content, localization, repetition },
    valid: errors.length === 0,
  };
}
