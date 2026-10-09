import { renderToStaticMarkup } from 'react-dom/server';

import { chineseSigns, getZodiacArtwork, westernSigns } from '../../assets/zodiac';
import { createEmptyDraftPortrait } from '../../entities/personality-profile';
import { createPersonalityProfile } from '../../features/personality-analysis/lib';
import { getPortraitQuestions } from '../../features/questionnaire/data/portraitQuestions';
import { PortraitMap } from '../../features/personality-report/components/PersonalizedReport';
import { BirthDateLens } from '../../features/birth-date/components/BirthDateLens';
import { NumerologyResult } from '../../features/numerology/components/NumerologyResult';
import { createNumerologyProfile } from '../../features/numerology/lib';
import { chineseZodiacReadiness } from '../../features/numerology/lib/chinese-zodiac-readiness';
import { standardTarotDeck, tarotSpreads } from '../../features/tarot/data';
import { createAutomaticSelections, createTarotReading } from '../../features/tarot/lib';
import { createReadingSynthesis } from '../../features/tarot/lib/interpretation-copy';
import { supportedLocales } from '../../shared/i18n';
import { ZodiacChapter } from '../../shared/ui/zodiac-artwork/ZodiacChapter';
import { QualityAssertions } from '../assertions';

const referenceDate = new Date(2026, 9, 7, 12);
const createdAt = '2026-10-07T10:00:00.000Z';

export function runPremiumProductUnificationGate() {
  const assertions = new QualityAssertions();
  let fixtureCount = 0;
  const check = (condition: unknown, code: string, message: string) =>
    assertions.assert(condition, { code, message });
  check(
    !chineseZodiacReadiness.enabled && chineseZodiacReadiness.calendarRange === null,
    'chinese-no-guessing',
    'Chinese Zodiac must remain unavailable without an audited date-aware calendar.',
  );
  const arts = [
    ...westernSigns.map((sign) => getZodiacArtwork('western', sign)),
    ...chineseSigns.map((sign) => getZodiacArtwork('chinese', sign)),
  ];
  for (const locale of supportedLocales) {
    for (const artwork of arts) {
      fixtureCount += 1;
      const html = renderToStaticMarkup(
        <ZodiacChapter artwork={artwork} locale={locale} title={artwork.sign}>
          <p>Interpretation</p>
        </ZodiacChapter>,
      );
      check(
        html.includes(`data-zodiac-chapter="${artwork.system}"`) &&
          html.includes(`data-zodiac-artwork="${artwork.id}"`) &&
          html.includes('srcSet=') &&
          html.includes('loading="lazy"') &&
          !html.includes('zodiak/'),
        `zodiac-chapter-${locale}-${artwork.id}`,
        'Every approved identity must resolve responsive production art within a labelled chapter, never a source PNG.',
      );
    }
    // These dates straddle real New Year boundaries. No speculative animal is rendered.
    for (const date of ['1990-01-01', '2024-02-09', '2024-02-10', '2025-01-28', '2025-01-29']) {
      fixtureCount += 1;
      const profile = createNumerologyProfile(date, locale, referenceDate);
      const before = JSON.stringify(profile);
      const html = renderToStaticMarkup(
        <NumerologyResult
          locale={locale}
          profile={profile}
          referenceDate={referenceDate}
          onBack={() => {}}
        />,
      );
      check(
        !html.includes('data-zodiac-chapter="chinese"') &&
          html.includes('data-zodiac-chapter="western"') &&
          JSON.stringify(profile) === before,
        `chinese-disabled-${locale}-${date}`,
        'Birth dates must keep the verified Western layer and immutable calculation without presenting a guessed Chinese sign.',
      );
    }
    for (const birthDate of ['1990-03-29', '1990-01-01', '2000-02-09', '1980-01-01']) {
      fixtureCount += 1;
      const profile = createNumerologyProfile(birthDate, locale, referenceDate);
      const html = renderToStaticMarkup(
        <BirthDateLens birthDate={birthDate} locale={locale} skipped={false} />,
      );
      check(
        html.includes(`<strong>${profile.lifePath.value}</strong>`) &&
          html.includes(`<dd>${profile.lifePath.value}</dd>`),
        `birth-preview-canonical-number-${locale}-${birthDate}`,
        'The birth-date preview must use the existing canonical reduction, including 33, without altering the result engine.',
      );
    }
    for (const birthDate of ['', '1990-03-29', '1990-07-10', '2000-02-09']) {
      fixtureCount += 1;
      const skipped = renderToStaticMarkup(
        <BirthDateLens birthDate={birthDate} locale={locale} skipped />,
      );
      check(
        skipped.includes('data-skipped="true"') &&
          !skipped.includes('data-active=') &&
          !skipped.includes('<dl') &&
          !skipped.includes('<small>') &&
          skipped.includes('<strong>·</strong>'),
        `birth-preview-no-stale-symbol-${locale}-${birthDate || 'empty'}`,
        'Skipping the optional date must show neither a stale number nor a stale sign/date, while retaining the localized skip explanation.',
      );
    }
    for (let variant = 0; variant < 8; variant += 1) {
      fixtureCount += 1;
      const draft = createEmptyDraftPortrait();
      const questions = getPortraitQuestions(locale);
      draft.answers = Object.fromEntries(
        questions.map((question, index) => [
          question.id,
          {
            optionIds: [question.options[(index + variant) % question.options.length]!.id],
            skipped: false,
          },
        ]),
      );
      const before = JSON.stringify(draft);
      const profile = createPersonalityProfile(draft, createdAt, locale);
      const repeat = createPersonalityProfile(draft, createdAt, locale);
      const insights = [
        ...profile.strengths,
        ...profile.communication.items,
        ...profile.energy.items,
      ];
      check(
        JSON.stringify(profile) === JSON.stringify(repeat) &&
          JSON.stringify(draft) === before &&
          profile.evidence.filter((e) => e.source === 'answers').length === questions.length,
        `portrait-complete-${locale}-${variant}`,
        'Varied complete portraits must preserve all concrete answer evidence and deterministic, unchanged input.',
      );
      const map = renderToStaticMarkup(<PortraitMap profile={profile} locale={locale} />);
      const descriptions = [...new Set(profile.portraitFacets.map((facet) => facet.description))];
      check(
        descriptions.every(
          (description) => map.split(renderToStaticMarkup(<>{description}</>)).length === 2,
        ) &&
          profile.portraitFacets.every((facet) => map.includes(`href="#${facet.targetId}"`)) &&
          JSON.stringify(profile) === JSON.stringify(repeat),
        `portrait-map-no-repeated-prose-${locale}-${variant}`,
        'The constellation must preserve all facet navigation and original content, while displaying each shared explanation once without mutating the profile.',
      );
      check(
        new Set(profile.recommendations.map((item) => item.title)).size ===
          profile.recommendations.length &&
          [
            profile.heroPhrase,
            ...insights.map((item) => item.description),
            ...profile.recommendations.map((item) => item.description),
          ].every(
            (text) => text.trim().length > 0 && !/undefined|NaN|\[object Object\]/u.test(text),
          ),
        `portrait-content-${locale}-${variant}`,
        'Complete portraits must provide distinct recommendation titles and valid substantive prose.',
      );
    }
    const single = tarotSpreads.find((spread) => spread.positions.length === 1)!;
    for (const card of standardTarotDeck.cards) {
      for (const orientation of ['upright', 'reversed'] as const) {
        fixtureCount += 1;
        const selection = { cardId: card.id, orientation, positionId: single.positions[0]!.id };
        const result = createReadingSynthesis({
          cards: [card],
          locale,
          positions: single.positions,
          selections: [selection],
        });
        const alternative = createReadingSynthesis({
          cards: [card],
          locale,
          positions: single.positions,
          selections: [
            { ...selection, orientation: orientation === 'upright' ? 'reversed' : 'upright' },
          ],
        });
        check(
          result.summary !== alternative.summary &&
            !result.summary.includes(result.practicalFocus) &&
            !/undefined|NaN|\[object Object\]/u.test(result.summary),
          `single-synthesis-${locale}-${card.id}-${orientation}`,
          'A single card must preserve its actual orientation, omit duplicate practical advice, and contain valid prose.',
        );
        const labels = ['На что обратить внимание:', 'На що звернути увагу:', 'What to watch for:'];
        check(
          labels.every((label) => !result.summary.includes(label)),
          `single-no-fabricated-contrast-${locale}-${card.id}-${orientation}`,
          'A single drawn card must not acquire a second, fabricated reversed warning.',
        );
      }
    }
    for (const spread of tarotSpreads) {
      for (const topic of ['open', 'love', 'money', 'work', 'decision'] as const) {
        for (const seed of ['sprint19-major', 'sprint19-suits', 'sprint19-reversed']) {
          fixtureCount += 1;
          const context = {
            birthDate: '1990-03-29',
            deckTheme: 'cosmic-minimal' as const,
            interests: [],
            locale,
            numerology: createNumerologyProfile('1990-03-29', locale, referenceDate),
            psychologyAnswers: [],
            seed,
            selectionMode: 'automatic' as const,
            spreadId: spread.id,
            topic,
          };
          const selections = createAutomaticSelections(standardTarotDeck.cards, spread, seed);
          const before = JSON.stringify({ context, selections });
          const reading = createTarotReading(context, selections, createdAt);
          const repeat = createTarotReading(context, selections, createdAt);
          check(
            JSON.stringify(reading) === JSON.stringify(repeat) &&
              JSON.stringify({ context, selections }) === before &&
              reading.interpretations.length === selections.length &&
              !/undefined|NaN|\[object Object\]/u.test(reading.summary) &&
              !reading.summary.includes(reading.practicalFocus),
            `reading-stress-${locale}-${spread.id}-${topic}-${seed}`,
            'Complete readings must remain deterministic, preserve the draw/context and avoid repeating the separate practical payoff.',
          );
        }
      }
    }
  }
  const pig = getZodiacArtwork('chinese', 'pig');
  check(
    pig.sourceNumber === 25 &&
      getZodiacArtwork('chinese', 'dragon').sourceNumber === 17 &&
      arts.every((art) => art.sourceNumber !== 24),
    'pig-dragon-identity',
    'Pig must remain source 25, Dragon source 17 and duplicate 24 must stay outside runtime.',
  );
  return assertions.result({ fixtureCount });
}
