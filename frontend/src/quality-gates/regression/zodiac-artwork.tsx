import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  chineseSigns,
  findPortraitZodiacArtwork,
  getZodiacArtwork,
  westernSigns,
} from '../../assets/zodiac';
import manifest from '../../assets/zodiac/source-manifest.json';
import { NumerologyResult } from '../../features/numerology/components/NumerologyResult';
import { createNumerologyProfile } from '../../features/numerology/lib';
import { createZodiacInterpretation } from '../../features/personality-analysis/lib';
import { ZodiacArtwork } from '../../shared/ui/zodiac-artwork/ZodiacArtwork';
import type { QualityAssertions } from '../assertions';

export function checkZodiacArtwork(assertions: QualityAssertions) {
  const artworks = [
    ...westernSigns.map((sign) => getZodiacArtwork('western', sign)),
    ...chineseSigns.map((sign) => getZodiacArtwork('chinese', sign)),
  ];
  assertions.assert(new Set(artworks.map((art) => art.id)).size === 24, {
    code: 'zodiac-artwork-complete',
    message: 'The registry must contain 24 unique system/sign mappings.',
  });
  artworks.forEach((art, index) => {
    const source = manifest.entries[index];
    assertions.assert(
      source?.sourceNumber === art.sourceNumber &&
        source.sourcePath === art.sourcePath &&
        source.sign === art.sign &&
        source.system === art.system &&
        art.reviewStatus === 'verified' &&
        art.crop === 'none' &&
        art.variants.every((variant, i) => {
          const recorded = source.variants[i];
          const path = resolve('public', variant.src.slice(1));
          return (
            variant.src === recorded?.path &&
            variant.width === recorded.width &&
            variant.height === recorded.height &&
            existsSync(path) &&
            readFileSync(path).subarray(8, 12).toString() === 'WEBP'
          );
        }),
      {
        code: `zodiac-artwork-mapping-${art.id}`,
        message:
          'Every runtime mapping must resolve to the audited source and three valid full-square production variants.',
      },
    );
  });
  const dates = [
    '04-06',
    '05-06',
    '06-06',
    '07-06',
    '08-06',
    '09-06',
    '10-06',
    '11-06',
    '12-06',
    '01-06',
    '02-06',
    '03-06',
  ];
  for (const locale of ['ru', 'en', 'uk', 'es'] as const) {
    westernSigns.forEach((sign, index) => {
      const birthDate = `1990-${dates[index]}`;
      const profile = createNumerologyProfile(birthDate, locale, new Date(2026, 9, 4, 12));
      const before = JSON.stringify(profile);
      const html = renderToStaticMarkup(
        <NumerologyResult
          locale={locale}
          onBack={() => {}}
          profile={profile}
          referenceDate={new Date(2026, 9, 4, 12)}
        />,
      );
      const insight = createZodiacInterpretation(birthDate, locale);
      const art = findPortraitZodiacArtwork(insight.title, locale);
      assertions.assert(
        profile.zodiac.signId === sign &&
          JSON.stringify(profile) === before &&
          html.includes(`data-zodiac-artwork="western-${sign}"`) &&
          html.includes('loading="lazy"') &&
          html.includes('width="1254"') &&
          html.includes('height="1254"') &&
          !html.includes('zodiak/') &&
          art?.sign === sign &&
          Boolean(art.descriptions[locale]),
        {
          code: `zodiac-artwork-results-${sign}-${locale}`,
          message:
            'Existing Western calculations and immutable localized Portrait titles must resolve the correct artwork without runtime source PNGs or model mutation.',
        },
      );
    });
    assertions.assert(findPortraitZodiacArtwork('Unknown historical title', locale) === undefined, {
      code: `zodiac-artwork-unknown-${locale}`,
      message: 'Unknown saved titles retain their text rather than guessing an artwork.',
    });
  }
  const pig = getZodiacArtwork('chinese', 'pig');
  const dragon = getZodiacArtwork('chinese', 'dragon');
  assertions.assert(
    pig.sourceNumber === 25 &&
      pig.sourcePath === 'zodiak/25.png' &&
      dragon.sourceNumber === 17 &&
      dragon.sourcePath === 'zodiak/17.png' &&
      artworks.every((art) => art.sourcePath !== 'zodiak/24.png'),
    {
      code: 'zodiac-artwork-pig-identity',
      message:
        'Approved Pig resolves only to source 25, Dragon remains source 17, and obsolete source 24 stays outside runtime mappings.',
    },
  );
  for (const locale of ['ru', 'en', 'uk', 'es'] as const) {
    artworks.forEach((art) => {
      const html = renderToStaticMarkup(
        <ZodiacArtwork artwork={art} locale={locale} sizes="100vw" />,
      );
      assertions.assert(
        html.includes(`data-zodiac-artwork="${art.id}"`) &&
          html.includes(art.variants[0]?.src ?? 'missing') &&
          html.includes(renderToStaticMarkup(<>{art.descriptions[locale]}</>)),
        {
          code: `zodiac-artwork-render-${art.id}-${locale}`,
          message:
            'All 24 verified identities must render their canonical responsive artwork and localized description.',
        },
      );
    });
  }
}
