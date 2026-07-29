import { useEffect, useId } from 'react';

import { Badge, Button, Container, Input, Stack, Surface, Typography } from '@shared/ui';

import { useBirthDate } from '../hooks';
import type { BirthDateFormValue, BirthDateSubmission, BirthDateValidationError } from '../types';
import styles from './BirthDateStep.module.css';

type BirthDateStepProps = {
  initialValue?: BirthDateFormValue;
  onBack: () => void;
  onChange?: (value: BirthDateFormValue) => void;
  onComplete: (value: BirthDateSubmission) => void;
};

const errorMessages: Record<BirthDateValidationError, string> = {
  future: 'Дата рождения не может быть в будущем.',
  invalid: 'Проверьте дату и попробуйте ещё раз.',
  'minimum-age': 'Сейчас пройти этот путь можно только совершеннолетним пользователям.',
  required: 'Выберите дату рождения или отметьте отказ от её использования.',
};

export function BirthDateStep({ initialValue, onBack, onChange, onComplete }: BirthDateStepProps) {
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
    initialValue,
    onChange,
    onSubmit: onComplete,
  });
  const instanceId = useId();
  const fieldId = `${instanceId}-birth-date`;
  const hintId = `${instanceId}-birth-date-hint`;
  const errorId = `${instanceId}-birth-date-error`;
  const skipId = `${instanceId}-skip-birth-date`;

  useEffect(() => {
    window.requestAnimationFrame(() => document.getElementById('birth-date-title')?.focus());
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!submit()) {
      window.requestAnimationFrame(() => document.getElementById(fieldId)?.focus());
    }
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="birth-date-title" className={styles.introduction}>
        <Container size="default">
          <Stack className={styles.introductionContent} gap="md">
            <Badge className={styles.stepBadge} tone="info">
              Последний шаг
            </Badge>
            <Typography as="h1" className={styles.title} id="birth-date-title" tabIndex={-1}>
              Добавьте дату рождения
            </Typography>
            <Typography className={styles.lead}>
              Она нужна только для нумерологического и зодиакального слоёв портрета. Время рождения
              сейчас не требуется.
            </Typography>
          </Stack>
        </Container>
      </section>

      <section aria-label="Дата рождения" className={styles.formSection}>
        <Container size="default">
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <Surface className={styles.formSurface} elevation="low">
              <Stack gap="lg">
                <Stack gap="sm">
                  <Typography as="h2" variant="heading-md">
                    Выберите дату
                  </Typography>
                  <Typography className={styles.muted}>
                    Астрологические и нумерологические выводы будут помечены как отдельные
                    интерпретации, а не как установленные факты.
                  </Typography>
                </Stack>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={fieldId}>
                    Дата рождения
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
                    Для текущей предварительной версии минимальный возраст — {minimumAgeYears} лет.
                  </Typography>
                  <Typography
                    aria-live="polite"
                    className={styles.error}
                    id={errorId}
                    role={visibleError ? 'alert' : undefined}
                    variant="caption"
                  >
                    {visibleError ? errorMessages[visibleError] : ''}
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
                    <span className={styles.skipTitle}>Я не хочу использовать дату рождения</span>
                    <span className={styles.skipDescription}>
                      Портрет будет создан без астрологического и нумерологического слоёв.
                    </span>
                  </span>
                </label>
              </Stack>
            </Surface>

            <Surface
              aria-labelledby="birth-date-privacy-title"
              className={styles.privacySurface}
              elevation="low"
            >
              <Stack gap="xs">
                <Typography as="h2" id="birth-date-privacy-title" variant="heading-sm">
                  Дата остаётся под вашим контролем
                </Typography>
                <Typography className={styles.muted}>
                  Сейчас данные используются только в этом локальном прохождении и не отправляются
                  на сервер.
                </Typography>
              </Stack>
            </Surface>

            <div className={styles.actions}>
              <Button onClick={onBack}>Назад</Button>
              <Button
                aria-describedby={visibleError ? errorId : hintId}
                className={styles.primaryButton}
                disabled={!canSubmit}
                type="submit"
              >
                Создать мой портрет
              </Button>
            </div>
          </form>
        </Container>
      </section>
    </div>
  );
}
