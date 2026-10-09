import { useState } from 'react';

import type { Locale } from '@shared/i18n';
import { Button, Container, Input, Typography } from '@shared/ui';

import { numerologyCopy } from '../data';
import { isValidNumerologyDate } from '../lib';
import styles from './Numerology.module.css';

export function NumerologyForm({
  initialBirthDate = '',
  locale,
  onSubmit,
}: {
  initialBirthDate?: string;
  locale: Locale;
  onSubmit: (date: string) => void;
}) {
  const copy = numerologyCopy[locale];
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [touched, setTouched] = useState(false);
  const valid = isValidNumerologyDate(birthDate);
  const error = touched && !valid;
  return (
    <div className={styles.page} data-numerology="entry">
      <section aria-labelledby="numerology-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <Typography as="p" className={styles.eyebrow} variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h1" id="numerology-title" variant="display">
                {copy.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.lead}
              </Typography>
              <form
                className={styles.form}
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  setTouched(true);
                  if (valid) onSubmit(birthDate);
                }}
              >
                <label className={styles.field} htmlFor="numerology-date">
                  {copy.date}
                </label>
                <Input
                  aria-describedby={`numerology-date-help${error ? ' numerology-date-error' : ''}`}
                  aria-invalid={error || undefined}
                  autoComplete="bday"
                  className={styles.dateInput}
                  id="numerology-date"
                  max={new Date().toISOString().slice(0, 10)}
                  onBlur={() => setTouched(true)}
                  onChange={(event) => setBirthDate(event.target.value)}
                  required
                  type="date"
                  value={birthDate}
                />
                <p className={styles.hint} id="numerology-date-help">
                  {copy.dateHelp}
                </p>
                {error ? (
                  <p className={styles.error} id="numerology-date-error" role="alert">
                    {copy.invalid}
                  </p>
                ) : null}
                <Button disabled={!valid} prominence="primary" size="large" type="submit">
                  {copy.submit}
                  <span aria-hidden="true">→</span>
                </Button>
                <p className={styles.hint}>{copy.sessionNote}</p>
              </form>
            </div>
            <div aria-hidden="true" className={styles.numberHero}>
              <img
                alt=""
                className={styles.entryArtwork}
                decoding="async"
                height="400"
                sizes="(min-width: 56rem) 52vw, 480px"
                src="/home/numerology-home-480.webp"
                srcSet="/home/numerology-home-480.webp 480w, /home/numerology-home-960.webp 960w"
                width="480"
              />
              <svg className={styles.numberDiagram} focusable="false" viewBox="0 0 560 560">
                <circle cx="280" cy="280" r="252" />
                <ellipse cx="280" cy="280" rx="272" ry="180" transform="rotate(-28 280 280)" />
                <path d="M280 14v26m0 480v26M14 280h26m480 0h26" />
                <path d="m280 16 5 12-5 12-5-12Zm0 504 5 12-5 12-5-12Z" />
              </svg>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
