import { birthDateCopy } from './../data/birth-date-copy';
import { useEffect, useId } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { useI18n } from '@shared/i18n';
import { Badge, Button, Container, Input, Stack, Typography } from '@shared/ui';

import { useBirthDate } from '../hooks';
import type { BirthDateFormValue, BirthDateSubmission } from '../types';
import styles from './BirthDateStep.module.css';
import { BirthDateLens } from './BirthDateLens';

type BirthDateStepProps = {
  onBack: () => void;
  onChange: (value: BirthDateFormValue) => void;
  onComplete: (value: BirthDateSubmission) => void;
  value: BirthDateFormValue;
};

export function BirthDateStep({
  onBack,
  onChange,
  onComplete,
  value: formValue,
}: BirthDateStepProps) {
  const { locale } = useI18n();
  const copy = birthDateCopy[locale];
  const {
    canSubmit,
    markTouched,
    maxDate,
    minimumAgeYears,
    setBirthDate,
    setSkipBirthDate,
    submit,
    value,
    visibleError,
  } = useBirthDate({
    onChange,
    onSubmit: onComplete,
    value: formValue,
  });
  const instanceId = useId();
  const fieldId = `${instanceId}-birth-date`;
  const hintId = `${instanceId}-birth-date-hint`;
  const errorId = `${instanceId}-birth-date-error`;
  const skipId = `${instanceId}-skip-birth-date`;

  useEffect(() => focusElementByIdOnNextFrame('birth-date-title'), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!submit()) {
      focusElementByIdOnNextFrame(fieldId);
    }
  };

  return (
    <div className={styles.root}>
      <Container size="wide">
        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit}
          aria-labelledby="birth-date-title"
        >
          <div className={styles.introduction}>
            <Stack className={styles.introductionContent} gap="md">
              <Badge className={styles.stepBadge} tone="info">
                {copy.introduction.badge}
              </Badge>
              <Typography
                as="h1"
                className={styles.title}
                id="birth-date-title"
                tabIndex={-1}
                variant="flow-title"
              >
                {copy.introduction.title}
              </Typography>
              <Typography className={styles.lead} variant="flow-lead">
                {copy.introduction.lead}
              </Typography>
            </Stack>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId}>
              {copy.dateLabel}
            </label>
            <Input
              aria-describedby={`${hintId}${visibleError ? ` ${errorId}` : ''}`}
              aria-invalid={visibleError ? 'true' : undefined}
              autoComplete="bday"
              disabled={value.skipBirthDate}
              id={fieldId}
              max={maxDate}
              onBlur={markTouched}
              onChange={(event) => setBirthDate(event.target.value)}
              required={!value.skipBirthDate}
              type="date"
              value={value.birthDate}
            />
            <Typography id={hintId} variant="caption">
              {copy.minimumAge(minimumAgeYears)}
            </Typography>
            <Typography
              className={styles.error}
              id={errorId}
              role={visibleError ? 'alert' : undefined}
              variant="caption"
            >
              {visibleError ? copy.errors[visibleError] : ''}
            </Typography>
          </div>

          <label className={styles.skipOption} htmlFor={skipId}>
            <input
              checked={value.skipBirthDate}
              className={styles.checkbox}
              id={skipId}
              onChange={(event) => setSkipBirthDate(event.target.checked)}
              role="switch"
              type="checkbox"
            />
            <span>
              <span className={styles.skipTitle}>{copy.skip.title}</span>
              <span className={styles.skipDescription}>{copy.skip.description}</span>
            </span>
          </label>
          <div className={styles.preview}>
            <BirthDateLens
              birthDate={canSubmit && !value.skipBirthDate ? value.birthDate : ''}
              locale={locale}
              skipped={value.skipBirthDate}
            />
            <Typography className={styles.previewNote} variant="caption">
              {copy.formLead}
            </Typography>
          </div>
          <div aria-labelledby="birth-date-privacy-title" className={styles.privacySurface}>
            <Stack gap="xs">
              <Typography as="h2" id="birth-date-privacy-title" variant="heading-sm">
                {copy.privacy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.privacy.description}</Typography>
            </Stack>
          </div>
          <div className={styles.actions}>
            <Button onClick={onBack}>{copy.actions.back}</Button>
            <Button
              aria-describedby={visibleError ? errorId : hintId}
              disabled={!canSubmit}
              prominence="primary"
              size="large"
              type="submit"
            >
              {copy.actions.create}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
