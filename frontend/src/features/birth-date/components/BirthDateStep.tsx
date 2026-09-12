import { useEffect, useId } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { useI18n, type Locale } from '@shared/i18n';
import { Badge, Button, Container, Input, Stack, Surface, Typography } from '@shared/ui';

import { useBirthDate } from '../hooks';
import type { BirthDateFormValue, BirthDateSubmission, BirthDateValidationError } from '../types';
import styles from './BirthDateStep.module.css';
import { BirthDateLens } from './BirthDateLens';

type BirthDateStepProps = {
  onBack: () => void;
  onChange: (value: BirthDateFormValue) => void;
  onComplete: (value: BirthDateSubmission) => void;
  value: BirthDateFormValue;
};

const copyByLocale: Record<
  Locale,
  {
    actions: { back: string; create: string };
    dateLabel: string;
    errors: Record<BirthDateValidationError, string>;
    formLabel: string;
    formLead: string;
    formTitle: string;
    introduction: { badge: string; lead: string; title: string };
    minimumAge: (years: number) => string;
    privacy: { description: string; title: string };
    skip: { description: string; title: string };
  }
> = {
  en: {
    actions: { back: 'Back', create: 'Create my portrait' },
    dateLabel: 'Birth date',
    errors: {
      future: 'Birth date cannot be in the future.',
      invalid: 'Check the date and try again.',
      'minimum-age': 'This feature is currently available only to adults.',
      required: 'Choose a birth date or opt out of using it.',
    },
    formLabel: 'Birth date',
    formLead:
      'Astrology and numerology readings are shown separately and never presented as established facts.',
    formTitle: 'Choose a date',
    introduction: {
      badge: 'Final step',
      lead: 'It is used only for optional numerology and zodiac readings. Birth time is not required.',
      title: 'Add your birth date',
    },
    minimumAge: (years) => `The minimum age for this preview is ${years}.`,
    privacy: {
      description: 'The date is used only in this local flow and is not sent to a server.',
      title: 'Your date stays under your control',
    },
    skip: {
      description: 'Your portrait will be created without astrology and numerology readings.',
      title: 'I do not want to use my birth date',
    },
  },
  ru: {
    actions: { back: 'Назад', create: 'Создать мой портрет' },
    dateLabel: 'Дата рождения',
    errors: {
      future: 'Дата рождения не может быть в будущем.',
      invalid: 'Проверьте дату и попробуйте ещё раз.',
      'minimum-age': 'Сейчас этот раздел доступен только совершеннолетним пользователям.',
      required: 'Выберите дату рождения или отметьте отказ от её использования.',
    },
    formLabel: 'Дата рождения',
    formLead:
      'Астрологический и нумерологический разборы будут показаны отдельно и не как установленные факты.',
    formTitle: 'Выберите дату',
    introduction: {
      badge: 'Последний шаг',
      lead: 'Она нужна только для дополнительных разборов по числам и знаку зодиака. Время рождения не требуется.',
      title: 'Добавьте дату рождения',
    },
    minimumAge: (years) => `Для текущей предварительной версии минимальный возраст — ${years} лет.`,
    privacy: {
      description:
        'Сейчас данные используются только в этом локальном прохождении и не отправляются на сервер.',
      title: 'Дата остаётся под вашим контролем',
    },
    skip: {
      description: 'Портрет будет создан без астрологического и нумерологического разборов.',
      title: 'Я не хочу использовать дату рождения',
    },
  },
  uk: {
    actions: { back: 'Назад', create: 'Створити мій портрет' },
    dateLabel: 'Дата народження',
    errors: {
      future: 'Дата народження не може бути в майбутньому.',
      invalid: 'Перевірте дату й спробуйте ще раз.',
      'minimum-age': 'Наразі цей розділ доступний лише повнолітнім користувачам.',
      required: 'Виберіть дату народження або відмовтеся від її використання.',
    },
    formLabel: 'Дата народження',
    formLead:
      'Астрологічний і нумерологічний розбори буде показано окремо, а не як встановлені факти.',
    formTitle: 'Виберіть дату',
    introduction: {
      badge: 'Останній крок',
      lead: 'Вона потрібна лише для додаткових розборів за числами й знаком зодіаку. Час народження не потрібен.',
      title: 'Додайте дату народження',
    },
    minimumAge: (years) => `Мінімальний вік для цієї попередньої версії — ${years} років.`,
    privacy: {
      description:
        'Зараз дані використовуються лише в цьому локальному проходженні й не надсилаються на сервер.',
      title: 'Дата залишається під вашим контролем',
    },
    skip: {
      description: 'Портрет буде створено без астрологічного й нумерологічного розборів.',
      title: 'Я не хочу використовувати дату народження',
    },
  },
};

export function BirthDateStep({
  onBack,
  onChange,
  onComplete,
  value: formValue,
}: BirthDateStepProps) {
  const { locale } = useI18n();
  const copy = copyByLocale[locale];
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
      <section aria-labelledby="birth-date-title" className={styles.introduction}>
        <Container size="default">
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
        </Container>
      </section>

      <section aria-label={copy.formLabel} className={styles.formSection}>
        <Container size="default">
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <Surface className={styles.formSurface} elevation="low">
              <Stack gap="lg">
                <BirthDateLens
                  birthDate={value.birthDate}
                  locale={locale}
                  skipped={value.skipBirthDate}
                />
                <Stack gap="sm">
                  <Typography as="h2" variant="heading-md">
                    {copy.formTitle}
                  </Typography>
                  <Typography className={styles.muted}>{copy.formLead}</Typography>
                </Stack>

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
              </Stack>
            </Surface>

            <Surface
              aria-labelledby="birth-date-privacy-title"
              className={styles.privacySurface}
              elevation="low"
            >
              <Stack gap="xs">
                <Typography as="h2" id="birth-date-privacy-title" variant="heading-sm">
                  {copy.privacy.title}
                </Typography>
                <Typography className={styles.muted}>{copy.privacy.description}</Typography>
              </Stack>
            </Surface>

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
      </section>
    </div>
  );
}
