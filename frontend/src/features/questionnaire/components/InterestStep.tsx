import { useId, useState } from 'react';

import type { Locale } from '@shared/i18n';
import { Button, Card, Container, Input, Progress, Stack, Typography } from '@shared/ui';

import { interestCopy } from '../data';
import styles from './InterestStep.module.css';
import { InterestConstellation } from './InterestConstellation';

const interestIds = [
  'technology',
  'creativity',
  'people',
  'movement',
  'travel',
  'learning',
  'business',
  'games',
  'music',
  'cinema',
  'nature',
  'selfDevelopment',
] as const;

type InterestStepProps = {
  initialInterests: readonly string[];
  locale: Locale;
  onBack: () => void;
  onComplete: (interests: readonly string[]) => void;
};

export function InterestStep({ initialInterests, locale, onBack, onComplete }: InterestStepProps) {
  const copy = interestCopy[locale];
  const existingOther = initialInterests.find((item) => item.startsWith('other:'))?.slice(6) ?? '';
  const [selected, setSelected] = useState(() =>
    initialInterests.filter((item) => !item.startsWith('other:')),
  );
  const [otherEnabled, setOtherEnabled] = useState(Boolean(existingOther));
  const [other, setOther] = useState(existingOther);
  const titleId = useId();
  const effectiveCount = selected.length + (otherEnabled && other.trim() ? 1 : 0);
  const canContinue = effectiveCount >= 3 && effectiveCount <= 6;

  const toggleInterest = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length + (otherEnabled && other.trim() ? 1 : 0) >= 6
          ? current
          : [...current, id],
    );
  };

  const submit = () => {
    if (!canContinue) return;
    onComplete([...selected, ...(otherEnabled && other.trim() ? [`other:${other.trim()}`] : [])]);
  };

  return (
    <section aria-labelledby={titleId} className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <Progress aria-label={copy.count(effectiveCount)} max={6} value={effectiveCount} />
          <Card className={styles.card}>
            <Stack gap="lg">
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {copy.eyebrow}
                </Typography>
                <Typography as="h1" id={titleId} tabIndex={-1} variant="flow-title">
                  {copy.title}
                </Typography>
                <Typography className={styles.muted}>{copy.description}</Typography>
              </Stack>

              <InterestConstellation
                labels={selected.map((id) => copy.options[id as keyof typeof copy.options] ?? id)}
                selected={selected}
              />

              <fieldset className={styles.fieldset}>
                <legend className={styles.visuallyHidden}>{copy.title}</legend>
                <div className={styles.interestGrid}>
                  {interestIds.map((id) => {
                    const checked = selected.includes(id);
                    return (
                      <label className={styles.interest} key={id}>
                        <input
                          checked={checked}
                          onChange={() => toggleInterest(id)}
                          type="checkbox"
                        />
                        <span aria-hidden="true" className={styles.interestMark} />
                        <span>{copy.options[id]}</span>
                      </label>
                    );
                  })}
                  <label className={styles.interest}>
                    <input
                      checked={otherEnabled}
                      onChange={(event) => setOtherEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span aria-hidden="true" className={styles.interestMark} />
                    <span>{copy.other}</span>
                  </label>
                </div>
              </fieldset>

              {otherEnabled ? (
                <label className={styles.otherField}>
                  <span>{copy.otherLabel}</span>
                  <Input
                    maxLength={40}
                    onChange={(event) => setOther(event.target.value)}
                    placeholder={copy.otherPlaceholder}
                    value={other}
                  />
                </label>
              ) : null}

              <Typography aria-live="polite" className={styles.count} role="status">
                {copy.count(effectiveCount)}
              </Typography>

              <div className={styles.actions}>
                <Button onClick={onBack}>{copy.back}</Button>
                <Button disabled={!canContinue} onClick={submit} prominence="primary" size="large">
                  {copy.continue}
                </Button>
              </div>
            </Stack>
          </Card>
        </div>
      </Container>
    </section>
  );
}
