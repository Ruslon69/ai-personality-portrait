import { zodiacElementLabels, zodiacModalityLabels } from '../data/zodiac-copy';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { localeDefinitions, type Locale } from '@shared/i18n';
import { getZodiacArtwork, isWesternSign } from '@assets/zodiac';
import { ZodiacChapter } from '@shared/ui/zodiac-artwork/ZodiacChapter';
import { Button, ButtonLink, Container, Typography } from '@shared/ui';
import { ROUTES } from '@shared/config';

import { numerologyCopy } from '../data';
import type { NumerologyCalculation, NumerologyProfile } from '../types';
import styles from './Numerology.module.css';

function CalculationDetails({
  calculation,
  locale,
  headingLevel = 'h3',
  contentLocale = locale,
}: {
  calculation: NumerologyCalculation;
  locale: Locale;
  headingLevel?: 'h3' | 'h4';
  contentLocale?: Locale;
}) {
  const copy = numerologyCopy[locale];
  const Heading = headingLevel;
  return (
    <details className={styles.disclosure} data-calculation-details={calculation.id}>
      <summary>
        {copy.details}
        <span className={styles.srOnly} lang={contentLocale}>
          {' '}
          — {calculation.label}
        </span>
      </summary>
      <div className={styles.detailGrid}>
        <div>
          <Heading>{copy.strengthsLabel}</Heading>
          <ul lang={contentLocale}>
            {calculation.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <Heading>{copy.tensionsLabel}</Heading>
          <ul lang={contentLocale}>
            {calculation.tensions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <details className={styles.equation}>
        <summary>
          {copy.showCalculation}
          <span className={styles.srOnly} lang={contentLocale}>
            {' '}
            — {calculation.label}
          </span>
        </summary>
        <ol aria-label={copy.calculationLabel} lang={locale}>
          {calculation.steps.map((step, index) => (
            <li key={`${step}-${index}`} lang={contentLocale}>
              {step}
            </li>
          ))}
        </ol>
      </details>
    </details>
  );
}

function NumberReading({
  calculation,
  locale,
  title,
  purpose,
  period,
  phase,
  contentLocale = locale,
}: {
  calculation: NumerologyCalculation;
  locale: Locale;
  title: string;
  purpose: string;
  period?: string;
  phase?: 'year' | 'month' | 'today';
  contentLocale?: Locale;
}) {
  const copy = numerologyCopy[locale];
  return (
    <article
      className={styles.numberReading}
      data-calculation={calculation.id}
      data-period-depth={phase}
      aria-labelledby={`${calculation.id}-title`}
    >
      <div className={styles.numberAnchor}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="78" />
          <ellipse cx="100" cy="100" rx="94" ry="52" transform="rotate(-25 100 100)" />
          <path d="M100 12v12m0 152v12M12 100h12m152 0h12" />
        </svg>
        <span className={styles.secondaryNumber}>{calculation.value}</span>
      </div>
      <div className={styles.numberCopy}>
        {period ? <p className={styles.eyebrow}>{period}</p> : null}
        <h3 id={`${calculation.id}-title`}>{title}</h3>
        <p className={styles.purpose}>{purpose}</p>
        <p lang={contentLocale}>{calculation.interpretation}</p>
        <p className={styles.smallAction}>
          <strong>{copy.applicationLabel}</strong>
          <span lang={contentLocale}>{calculation.application}</span>
        </p>
        <CalculationDetails
          calculation={calculation}
          locale={locale}
          contentLocale={contentLocale}
          headingLevel="h4"
        />
      </div>
    </article>
  );
}

export function NumerologyResult({
  locale,
  onBack,
  profile,
  referenceDate,
  persistenceFailed = false,
  onRetrySave,
}: {
  locale: Locale;
  onBack: () => void;
  profile: NumerologyProfile;
  referenceDate: Date;
  persistenceFailed?: boolean;
  onRetrySave?: () => void;
}) {
  const copy = numerologyCopy[locale];
  const dateFormat = localeDefinitions[locale].formatTag;
  const contentLocale = profile.locale;
  const elementLabel = zodiacElementLabels[contentLocale][profile.zodiac.element];
  const modalityLabel = zodiacModalityLabels[contentLocale][profile.zodiac.modality];
  return (
    <div
      className={styles.page}
      data-numerology="result"
      lang={locale}
      data-result-locale={contentLocale}
    >
      <section
        aria-labelledby="numerology-result-title"
        className={styles.resultHero}
        data-calculation="life-path"
      >
        <Container size="wide">
          {persistenceFailed ? (
            <div className={styles.persistenceNote} data-numerology-unsaved>
              <p role="status" aria-live="polite" aria-atomic="true">
                {productContractCopy[locale].numerologyUnsaved}
              </p>
              {onRetrySave ? (
                <Button onClick={onRetrySave} prominence="quiet">
                  {productContractCopy[locale].retrySaving}
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className={styles.resultTopline}>
            <p className={styles.eyebrow}>{copy.resultEyebrow}</p>
            <Button onClick={onBack} prominence="quiet">
              {copy.back}
            </Button>
          </div>
          <Typography as="h1" id="numerology-result-title" variant="display">
            {copy.path}
          </Typography>
          <div className={styles.resultHeroGrid}>
            <div className={styles.personalSymbol}>
              <svg aria-hidden="true" focusable="false" viewBox="0 0 360 360">
                <circle cx="180" cy="180" r="152" />
                <circle cx="180" cy="180" r="126" />
                <ellipse cx="180" cy="180" rx="173" ry="100" transform="rotate(-30 180 180)" />
                <path d="m180 13 5 12-5 12-5-12ZM180 323l5 12-5 12-5-12Z" />
                <path d="M25 180h22m266 0h22" />
              </svg>
              <span className={styles.coreNumber}>{profile.lifePath.value}</span>
            </div>
            <div className={styles.coreCopy}>
              <p className={styles.eyebrow} lang={contentLocale}>
                {profile.lifePath.label}
              </p>
              <p className={styles.purpose}>{copy.pathPurpose}</p>
              <p className={styles.mainInterpretation} lang={contentLocale}>
                {profile.lifePath.interpretation}
              </p>
              <div className={styles.takeaway}>
                <h2>{copy.applicationLabel}</h2>
                <p lang={contentLocale}>{profile.lifePath.application}</p>
              </div>
              <a className={styles.primaryLink} href="#numerology-cycles">
                {copy.cyclesCta}
                <span aria-hidden="true">↓</span>
              </a>
              <CalculationDetails
                calculation={profile.lifePath}
                locale={locale}
                contentLocale={contentLocale}
              />
            </div>
          </div>
        </Container>
      </section>
      <section aria-labelledby="numerology-traits" className={styles.section}>
        <Container size="wide">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{copy.traitsEyebrow}</p>
            <h2 id="numerology-traits">{copy.traitsTitle}</h2>
          </div>
          <div className={styles.traits}>
            <NumberReading
              contentLocale={contentLocale}
              calculation={profile.birthday}
              locale={locale}
              title={copy.birthdayTitle}
              purpose={copy.birthdayPurpose}
            />
            <NumberReading
              contentLocale={contentLocale}
              calculation={profile.attitude}
              locale={locale}
              title={copy.attitudeTitle}
              purpose={copy.attitudePurpose}
            />
          </div>
        </Container>
      </section>
      <section
        aria-labelledby="numerology-cycles-title"
        className={styles.section}
        id="numerology-cycles"
      >
        <Container size="wide">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{copy.period}</p>
            <h2 id="numerology-cycles-title">{copy.cyclesTitle}</h2>
            <p>{copy.cyclesLead}</p>
          </div>
          <div className={styles.cycles}>
            <NumberReading
              contentLocale={contentLocale}
              phase="year"
              calculation={profile.personalYear}
              locale={locale}
              title={copy.year}
              purpose={copy.yearPurpose}
              period={new Intl.DateTimeFormat(dateFormat, { year: 'numeric' }).format(
                referenceDate,
              )}
            />
            <NumberReading
              contentLocale={contentLocale}
              phase="month"
              calculation={profile.personalMonth}
              locale={locale}
              title={copy.month}
              purpose={copy.monthPurpose}
              period={new Intl.DateTimeFormat(dateFormat, { month: 'long' }).format(referenceDate)}
            />
            <NumberReading
              contentLocale={contentLocale}
              phase="today"
              calculation={profile.personalDay}
              locale={locale}
              title={copy.day}
              purpose={copy.dayPurpose}
              period={new Intl.DateTimeFormat(dateFormat, { day: 'numeric', month: 'long' }).format(
                referenceDate,
              )}
            />
          </div>
        </Container>
      </section>
      <section className={styles.closing}>
        <Container size="wide">
          <details className={styles.zodiac}>
            <summary>
              {copy.zodiac}
              <span className={styles.zodiacName} lang={contentLocale}>
                {profile.zodiac.sign}
              </span>
            </summary>
            {isWesternSign(profile.zodiac.signId) ? (
              <ZodiacChapter
                artwork={getZodiacArtwork('western', profile.zodiac.signId)}
                locale={locale}
                contentLocale={contentLocale}
                title={profile.zodiac.sign}
              >
                <div className={styles.zodiacCopy} lang={contentLocale}>
                  <p className={styles.purpose}>
                    {elementLabel} · {modalityLabel}
                  </p>
                  <p>{profile.zodiac.interpretation}</p>
                </div>
              </ZodiacChapter>
            ) : null}
          </details>
          <div className={styles.bottomActions}>
            <p className={styles.hint}>{copy.disclaimer}</p>
            <ButtonLink href={ROUTES.tarot} prominence="secondary">
              {copy.tarotCta}
              <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </Container>
      </section>
    </div>
  );
}
