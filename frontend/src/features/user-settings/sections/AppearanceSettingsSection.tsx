import type { ThemeMode } from '@app/providers/theme';
import { Button, Container, Stack, Toast, Typography } from '@shared/ui';

import type { AppearanceOption } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type AppearanceSettingsSectionProps = {
  copy: UserSettingsCopy['appearance'];
  onChange: (theme: ThemeMode) => void;
  options: readonly AppearanceOption[];
  value: ThemeMode;
  storageError: string;
  onRetry: () => void;
  retryLabel: string;
};

export function AppearanceSettingsSection({
  copy,
  onChange,
  options,
  value,
  storageError,
  onRetry,
  retryLabel,
}: AppearanceSettingsSectionProps) {
  return (
    <section aria-labelledby="appearance-settings-title" className={styles.section}>
      <Container size="wide">
        <div className={styles.settingsSurface}>
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" className={styles.goldEyebrow} variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="appearance-settings-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.description}</Typography>
            </Stack>

            <fieldset
              aria-describedby={
                storageError
                  ? 'appearance-settings-description appearance-settings-error'
                  : 'appearance-settings-description'
              }
              className={styles.fieldset}
            >
              <legend className={styles.visuallyHidden}>{copy.legend}</legend>
              <span className={styles.visuallyHidden} id="appearance-settings-description">
                {copy.options}
              </span>
              <div className={styles.optionGrid}>
                {options.map((option) => (
                  <label className={styles.choiceCard} key={option.value}>
                    <input
                      checked={value === option.value}
                      className={styles.control}
                      name="appearance-theme"
                      onChange={() => onChange(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span>
                      <span className={styles.choiceTitle}>{option.label}</span>
                      <span className={styles.choiceDescription}>{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {storageError ? (
              <Toast id="appearance-settings-error" tone="error">
                <p>{storageError}</p>
                <Button onClick={onRetry} prominence="secondary">
                  {retryLabel}
                </Button>
              </Toast>
            ) : null}
          </Stack>
        </div>
      </Container>
    </section>
  );
}
