import type { ThemeMode } from '@app/providers/theme';
import { Container, Stack, Surface, Typography } from '@shared/ui';

import type { AppearanceOption } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type AppearanceSettingsSectionProps = {
  copy: UserSettingsCopy['appearance'];
  onChange: (theme: ThemeMode) => void;
  options: readonly AppearanceOption[];
  value: ThemeMode;
};

export function AppearanceSettingsSection({
  copy,
  onChange,
  options,
  value,
}: AppearanceSettingsSectionProps) {
  return (
    <section aria-labelledby="appearance-settings-title" className={styles.section}>
      <Container size="wide">
        <Surface className={styles.settingsSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="appearance-settings-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.description}</Typography>
            </Stack>

            <fieldset
              aria-describedby="appearance-settings-description"
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
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}
