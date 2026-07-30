import { Container, Stack, Surface, Typography } from '@shared/ui';

import type { SettingsConsent, SettingsConsentId, SettingsConsentValues } from '../types';
import styles from './UserSettingsSections.module.css';

type PrivacySettingsSectionProps = {
  consents: SettingsConsentValues;
  items: readonly SettingsConsent[];
  onChange: (id: SettingsConsentId, enabled: boolean) => void;
};

export function PrivacySettingsSection({ consents, items, onChange }: PrivacySettingsSectionProps) {
  return (
    <section aria-labelledby="privacy-settings-title" className={styles.section}>
      <Container size="wide">
        <Surface className={styles.settingsSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                Приватность
              </Typography>
              <Typography as="h2" id="privacy-settings-title" variant="heading-lg">
                Каждое согласие — отдельный выбор
              </Typography>
              <Typography className={styles.muted}>
                Все параметры изначально выключены и действуют только до обновления страницы.
              </Typography>
            </Stack>

            <fieldset className={styles.fieldset}>
              <legend className={styles.visuallyHidden}>Отдельные согласия приватности</legend>
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
