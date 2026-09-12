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
            <Stack align="start" className={styles.heroCopy} gap="lg">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h1" id="numerology-title" variant="display">
                {copy.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.lead}
              </Typography>
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
                    <Button disabled={!valid} prominence="primary" size="large" type="submit">
                      {copy.submit}
                    </Button>
                  </Stack>
                </form>
              </Surface>
            </Stack>
            <div aria-hidden="true" className={styles.numberHero}>
              <svg className={styles.numberDiagram} focusable="false" viewBox="0 0 560 360">
                <ellipse className={styles.diagramOrbit} cx="280" cy="180" rx="205" ry="126" />
                <ellipse
                  className={styles.diagramOrbitSecondary}
                  cx="280"
                  cy="180"
                  rx="158"
                  ry="96"
                />
                <path className={styles.diagramLink} d="M132 92 280 180 428 92" />
                <path className={styles.diagramLink} d="M120 268 280 180 440 268" />
                <g className={styles.diagramNode} transform="translate(132 92)">
                  <circle r="32" />
                  <text textAnchor="middle" y="10">
                    2
                  </text>
                </g>
                <g className={styles.diagramNode} transform="translate(428 92)">
                  <circle r="32" />
                  <text textAnchor="middle" y="10">
                    7
                  </text>
                </g>
                <g className={styles.diagramNode} transform="translate(120 268)">
                  <circle r="24" />
                  <text textAnchor="middle" y="8">
                    3
                  </text>
                </g>
                <g className={styles.diagramNode} transform="translate(440 268)">
                  <circle r="24" />
                  <text textAnchor="middle" y="8">
                    6
                  </text>
                </g>
                <g className={styles.diagramCore}>
                  <circle cx="280" cy="180" r="72" />
                  <text className={styles.diagramFormula} textAnchor="middle" x="280" y="162">
                    2 + 7
                  </text>
                  <text className={styles.diagramValue} textAnchor="middle" x="280" y="222">
                    9
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
