import { useState } from 'react';

import type { Locale } from '@shared/i18n';
import { Badge, Button, ButtonLink, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import { ROUTES } from '@shared/config';
import { numerologyCopy } from '../data';
import type { NumerologyCalculation, NumerologyProfile, NumerologyViewMode } from '../types';
import styles from './Numerology.module.css';

function CalculationCard({
  calculation,
  locale,
  title,
}: {
  calculation: NumerologyCalculation;
  locale: Locale;
  title: string;
}) {
  const copy = numerologyCopy[locale];
  const [mode, setMode] = useState<NumerologyViewMode>('brief');
  return (
    <Card className={styles.calculationCard} data-mode={mode}>
      <div className={styles.calculationHeader}>
        <Badge tone="warning">{copy.interpretation}</Badge>
        <div className={styles.cardNumber} aria-hidden="true">
          {calculation.value}
        </div>
      </div>
      <Stack gap="md">
        <Typography as="h3" variant="heading-md">
          {title}
        </Typography>
        <Typography>{calculation.interpretation}</Typography>
        <div aria-label={title} className={styles.viewControls} role="group">
          {(['brief', 'details', 'calculation'] as const).map((value) => (
            <Button
              aria-pressed={mode === value}
              key={value}
              onClick={() => setMode(value)}
              prominence={mode === value ? 'secondary' : 'quiet'}
            >
              {value === 'brief'
                ? copy.brief
                : value === 'details'
                  ? copy.details
                  : copy.showCalculation}
            </Button>
          ))}
        </div>
        {mode === 'details' ? (
          <div className={styles.detailGrid}>
            <div>
              <strong>{copy.strengthsLabel}</strong>
              <ul>
                {calculation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{copy.tensionsLabel}</strong>
              <ul>
                {calculation.tensions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{copy.applicationLabel}</strong>
              <p>{calculation.application}</p>
            </div>
          </div>
        ) : null}
        {mode === 'calculation' ? (
          <div className={styles.equation}>
            <strong>{copy.calculationLabel}</strong>
            {calculation.steps.map((step, index) => (
              <span key={`${step}-${index}`}>{step}</span>
            ))}
          </div>
        ) : null}
      </Stack>
    </Card>
  );
}

export function NumerologyResult({
  locale,
  onBack,
  profile,
}: {
  locale: Locale;
  onBack: () => void;
  profile: NumerologyProfile;
}) {
  const copy = numerologyCopy[locale];
  const elementLabel = {
    ru: { fire: 'огонь', earth: 'земля', air: 'воздух', water: 'вода' },
    en: { fire: 'fire', earth: 'earth', air: 'air', water: 'water' },
    uk: { fire: 'вогонь', earth: 'земля', air: 'повітря', water: 'вода' },
  }[locale][profile.zodiac.element];
  const modalityLabel = {
    ru: { cardinal: 'кардинальная', fixed: 'фиксированная', mutable: 'мутабельная' },
    en: { cardinal: 'cardinal', fixed: 'fixed', mutable: 'mutable' },
    uk: { cardinal: 'кардинальна', fixed: 'фіксована', mutable: 'мутабельна' },
  }[locale][profile.zodiac.modality];
  return (
    <div className={styles.page}>
      <section aria-labelledby="numerology-result-title" className={styles.resultHero}>
        <Container size="wide">
          <Surface className={styles.resultHeroSurface} elevation="low">
            <div className={styles.resultHeroGrid}>
              <div aria-label={copy.symbol} className={styles.personalSymbol} role="img">
                <i />
                <i />
                <i />
                <strong>{profile.lifePath.value}</strong>
              </div>
              <Stack align="start" gap="md">
                <Badge tone="warning">{copy.resultEyebrow}</Badge>
                <Typography as="h1" id="numerology-result-title" variant="display">
                  {profile.lifePath.interpretation}
                </Typography>
                <Typography variant="lead">
                  {copy.period}: {profile.personalYear.interpretation}
                </Typography>
                <div className={styles.heroNumbers}>
                  <span>
                    {profile.lifePath.label}: <strong>{profile.lifePath.value}</strong>
                  </span>
                  <span>
                    {profile.personalYear.label}: <strong>{profile.personalYear.value}</strong>
                  </span>
                  <span>
                    {profile.personalMonth.label}: <strong>{profile.personalMonth.value}</strong>
                  </span>
                </div>
              </Stack>
            </div>
          </Surface>
        </Container>
      </section>
      <section className={styles.section}>
        <Container size="wide">
          <div className={styles.resultGrid}>
            <CalculationCard calculation={profile.lifePath} locale={locale} title={copy.path} />
            <CalculationCard
              calculation={profile.attitude}
              locale={locale}
              title={copy.manifestation}
            />
            <CalculationCard
              calculation={profile.birthday}
              locale={locale}
              title={copy.strengthens}
            />
            <CalculationCard calculation={profile.personalYear} locale={locale} title={copy.year} />
            <CalculationCard
              calculation={profile.personalMonth}
              locale={locale}
              title={copy.month}
            />
          </div>
        </Container>
      </section>
      <section aria-labelledby="zodiac-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.zodiacSurface}>
            <div className={styles.zodiacRing} aria-hidden="true">
              <span>{profile.zodiac.sign.slice(0, 1)}</span>
            </div>
            <Stack gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.zodiac}
              </Typography>
              <Typography as="h2" id="zodiac-title" variant="heading-lg">
                {profile.zodiac.sign} · {elementLabel} · {modalityLabel}
              </Typography>
              <Typography>{profile.zodiac.interpretation}</Typography>
              <Surface className={styles.futureModule}>
                <strong>{copy.astrologyFuture}</strong>
                <span>{copy.astrologyFutureNote}</span>
              </Surface>
            </Stack>
          </Surface>
        </Container>
      </section>
      <section aria-labelledby="numerology-tarot-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.tarotBridge} elevation="low">
            <Stack gap="md">
              <Typography as="h2" id="numerology-tarot-title" variant="heading-lg">
                {copy.tarot}
              </Typography>
              <Typography>{profile.personalYear.application}</Typography>
              <ButtonLink href={ROUTES.tarotReading} prominence="primary" size="large">
                {copy.tarotCta}
              </ButtonLink>
            </Stack>
            <div aria-hidden="true" className={styles.bridgeCards}>
              <i />
              <i />
              <i />
            </div>
          </Surface>
        </Container>
      </section>
      <section className={styles.section}>
        <Container size="wide">
          <Surface className={styles.futureModule}>
            <Typography as="h2" variant="heading-md">
              {copy.future}
            </Typography>
            <Typography>{copy.futureNote}</Typography>
          </Surface>
          <div className={styles.bottomActions}>
            <Button onClick={onBack}>{copy.back}</Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
