import { useState } from 'react';

import type { Locale } from '@shared/i18n';
import { Button, Container, Input, Stack, Surface, Typography } from '@shared/ui';

import { numerologyCopy } from '../data';
import { isValidNumerologyDate } from '../lib';
import styles from './Numerology.module.css';

export function NumerologyForm({
  locale,
  onSubmit,
}: {
  locale: Locale;
  onSubmit: (date: string) => void;
}) {
  const copy = numerologyCopy[locale];
  const [birthDate, setBirthDate] = useState('');
  const [touched, setTouched] = useState(false);
  const valid = isValidNumerologyDate(birthDate);
  return (
    <div className={styles.page}>
      <section aria-labelledby="numerology-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <Stack align="start" gap="lg">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h1" id="numerology-title" variant="display">
                {copy.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.lead}
              </Typography>
            </Stack>
            <div aria-hidden="true" className={styles.numberHero}>
              <span>1</span>
              <span>1</span>
              <i />
              <b>∞</b>
            </div>
          </div>
        </Container>
      </section>
      <section aria-label={copy.date} className={styles.section}>
        <Container size="default">
          <Surface className={styles.formSurface} elevation="low">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setTouched(true);
                if (valid) onSubmit(birthDate);
              }}
            >
              <Stack gap="lg">
                <label className={styles.field}>
                  <span>{copy.date}</span>
                  <Input
                    aria-invalid={touched && !valid ? true : undefined}
                    autoComplete="bday"
                    max={new Date().toISOString().slice(0, 10)}
                    onBlur={() => setTouched(true)}
                    onChange={(event) => setBirthDate(event.target.value)}
                    required
                    type="date"
                    value={birthDate}
                  />
                </label>
                {touched && !valid ? (
                  <Typography className={styles.error} role="alert">
                    {copy.invalid}
                  </Typography>
                ) : null}
                <Typography className={styles.disclaimer}>{copy.disclaimer}</Typography>
                <Button disabled={!valid} prominence="primary" size="large" type="submit">
                  {copy.submit}
                </Button>
              </Stack>
            </form>
          </Surface>
        </Container>
      </section>
    </div>
  );
}
