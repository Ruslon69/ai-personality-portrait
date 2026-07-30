import { localeOptions, useI18n } from '@shared/i18n';

import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useI18n();

  return (
    <label className={styles.root}>
      <span className={styles.visuallyHidden}>{messages.shell.header.language}</span>
      <select
        aria-label={messages.shell.header.language}
        className={styles.select}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        title={messages.shell.header.language}
        value={locale}
      >
        {localeOptions.map((option) => (
          <option aria-label={option.label} key={option.locale} value={option.locale}>
            {option.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
