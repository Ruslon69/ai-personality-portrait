import { Container, Stack, Surface, Typography } from '@shared/ui';

import type { SettingsConsent, SettingsConsentId, SettingsConsentValues } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

type PrivacySettingsSectionProps = {
  consents: SettingsConsentValues;
  copy: UserSettingsCopy['privacy'];
  items: readonly SettingsConsent[];
  onChange: (id: SettingsConsentId, enabled: boolean) => void;
};

export function PrivacySettingsSection({
  consents,
  copy,
  items,
  onChange,
}: PrivacySettingsSectionProps) {
  return (
    <section aria-labelledby="privacy-settings-title" className={styles.section}>
      <Container size="wide">
        <Surface className={styles.settingsSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="privacy-settings-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.description}</Typography>
            </Stack>

            <fieldset className={styles.fieldset}>
              <legend className={styles.visuallyHidden}>{copy.legend}</legend>
              <div className={styles.consentList}>
                {items.map((item) => (
                  <label className={styles.consentRow} key={item.id}>
                    <input
                      checked={consents[item.id]}
                      className={styles.control}
                      onChange={(event) => onChange(item.id, event.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      <span className={styles.choiceTitle}>{item.label}</span>
                      <span className={styles.choiceDescription}>{item.description}</span>
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
