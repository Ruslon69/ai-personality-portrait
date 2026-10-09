import { renderToStaticMarkup } from 'react-dom/server';

import { NumerologyForm } from '../../features/numerology/components/NumerologyForm';
import { NumerologyResult } from '../../features/numerology/components/NumerologyResult';
import { numerologyCopy } from '../../features/numerology/data';
import { createNumerologyProfile, isValidNumerologyDate } from '../../features/numerology/lib';
import type { QualityAssertions } from '../assertions';

const noop = () => {};
const escaped = (text: string) => renderToStaticMarkup(<>{text}</>);

export function checkNumerologyExperience(assertions: QualityAssertions) {
  const referenceDate = new Date(2026, 7, 5, 12);
  for (const locale of ['ru', 'en', 'uk', 'es'] as const) {
    const profile = createNumerologyProfile('1990-01-01', locale, referenceDate);
    const before = JSON.stringify(profile);
    const calculations = [
      profile.lifePath,
      profile.birthday,
      profile.attitude,
      profile.personalYear,
      profile.personalMonth,
      profile.personalDay,
    ];
    const html = renderToStaticMarkup(
      <NumerologyResult
        locale={locale}
        onBack={noop}
        profile={profile}
        referenceDate={referenceDate}
      />,
    );
    assertions.assert(
      calculations.map((item) => item.value).join(',') === '3,1,2,3,11,7' &&
        JSON.stringify(profile) === before &&
        calculations.every(
          (item) =>
            html.includes(`data-calculation="${item.id}"`) &&
            html.includes(escaped(item.interpretation)) &&
            html.includes(escaped(item.application)) &&
            [...item.steps, ...item.strengths, ...item.tensions].every((text) =>
              html.includes(escaped(text)),
            ),
        ),
      {
        code: `numerology-experience-content-${locale}`,
        message:
          'All six original calculations, meanings, practical advice and optional depth must render without mutating the profile.',
      },
    );
    assertions.assert(
      (html.match(/<h1\b/g) ?? []).length === 1 &&
        html.includes(escaped(numerologyCopy[locale].path)) &&
        (html.match(/data-calculation-details=/g) ?? []).length === 6 &&
        !html.includes(' open=""') &&
        html.includes('href="#numerology-cycles"') &&
        html.indexOf('data-calculation="personal-year"') <
          html.indexOf('data-calculation="personal-month"') &&
        html.indexOf('data-calculation="personal-month"') <
          html.indexOf('data-calculation="personal-day"'),
      {
        code: `numerology-experience-hierarchy-${locale}`,
        message:
          'The localized main number must precede year/month/day with native, initially collapsed deeper explanations.',
      },
    );
    const empty = renderToStaticMarkup(<NumerologyForm locale={locale} onSubmit={noop} />);
    const valid = renderToStaticMarkup(
      <NumerologyForm locale={locale} onSubmit={noop} initialBirthDate="1990-01-01" />,
    );
    const invalid = renderToStaticMarkup(
      <NumerologyForm locale={locale} onSubmit={noop} initialBirthDate="invalid" />,
    );
    assertions.assert(
      empty.includes('disabled=""') &&
        invalid.includes('disabled=""') &&
        !valid.includes('disabled=""') &&
        valid.includes('value="1990-01-01"') &&
        empty.includes('for="numerology-date"') &&
        empty.includes('aria-describedby="numerology-date-help"') &&
        empty.includes(escaped(numerologyCopy[locale].dateHelp)) &&
        (empty.match(/<h1\b/g) ?? []).length === 1,
      {
        code: `numerology-experience-input-${locale}`,
        message:
          'The form must label its date, preserve a valid session date and block empty/invalid submission in all locales.',
      },
    );
  }
  assertions.assert(
    isValidNumerologyDate('1990-01-01', referenceDate) &&
      !isValidNumerologyDate('2020-01-01', referenceDate) &&
      !isValidNumerologyDate('1990-02-31', referenceDate) &&
      !isValidNumerologyDate('2030-01-01', referenceDate),
    {
      code: 'numerology-experience-date-boundaries',
      message: 'Calendar, future-date and existing minimum-age validation must remain intact.',
    },
  );
}
