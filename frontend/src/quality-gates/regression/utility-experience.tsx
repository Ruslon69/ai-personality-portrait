import { renderToStaticMarkup } from 'react-dom/server';

import { createTarotPreferencesActions } from '../../features/tarot/model/tarot-preferences-store';
import {
  DEFAULT_TAROT_PREFERENCES,
  type TarotPreferences,
} from '../../features/tarot/lib/tarot-preferences';
import { AppearanceSettingsSection } from '../../features/user-settings/sections/AppearanceSettingsSection';
import { getLocalizedUserSettingsData, userSettingsCopy } from '../../features/user-settings/data';
import { LegalPage } from '../../pages/legal/LegalPage';
import { privacyPolicyCopy, termsCopy } from '../../pages/legal/legal-copy';
import { createStore } from '../../store';
import type { Locale } from '../../shared/i18n';
import type { QualityAssertions } from '../assertions';

export function checkUtilityExperience(assertions: QualityAssertions) {
  const store = createStore<TarotPreferences>({ ...DEFAULT_TAROT_PREFERENCES });
  let canPersist = false;
  const writes: TarotPreferences[] = [];
  const actions = createTarotPreferencesActions(store, (value) => {
    writes.push({ ...value });
    return canPersist;
  });
  assertions.assert(
    actions.update({ revealAnimations: false }) === false && !store.getState().revealAnimations,
    {
      code: 'preferences-storage-failure',
      message:
        'A denied preference write must report failure while preserving the current-session choice.',
    },
  );
  canPersist = true;
  assertions.assert(actions.update({ revealAnimations: false }) === true && writes.length === 2, {
    code: 'preferences-storage-retry',
    message: 'Retrying the same preference must attempt persistence again and return its result.',
  });
  actions.update({ historyLimit: 100, allowReversedCards: false });
  canPersist = false;
  assertions.assert(actions.restoreDefaults() === false && store.getState().historyLimit === 75, {
    code: 'preferences-reset-failure',
    message: 'Reset must keep the existing defaults and report a failed write.',
  });
  canPersist = true;
  assertions.assert(
    actions.restoreDefaults() === true &&
      JSON.stringify(writes.at(-1)) === JSON.stringify(DEFAULT_TAROT_PREFERENCES),
    {
      code: 'preferences-reset-retry',
      message: 'Reset retry must persist the complete original defaults.',
    },
  );

  (['ru', 'en', 'uk', 'es'] as const).forEach((locale: Locale) => {
    for (const document of [privacyPolicyCopy[locale], termsCopy[locale]]) {
      const html = renderToStaticMarkup(<LegalPage document={document} />);
      const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
      assertions.assert(
        (html.match(/<h1\b/g)?.length ?? 0) === 1 &&
          anchors.length === document.sections.length &&
          anchors.every((id) => html.includes(`id="${id}" tabindex="-1"`)) &&
          html.includes('<aside'),
        {
          code: 'legal-accessible-document',
          message: `${locale}: Legal pages need one H1, focusable section destinations, and the owner notice.`,
        },
      );
    }
    const html = renderToStaticMarkup(
      <AppearanceSettingsSection
        copy={userSettingsCopy[locale].appearance}
        options={getLocalizedUserSettingsData(locale).appearanceOptions}
        onChange={() => {}}
        value="dark"
        storageError="Storage test failure"
        onRetry={() => {}}
        retryLabel="Retry"
      />,
    );
    assertions.assert(
      (html.match(/type="radio"/g)?.length ?? 0) === 3 &&
        (html.match(/ checked=""/g)?.length ?? 0) === 1 &&
        html.includes('<legend') &&
        html.includes('role="alert"') &&
        html.includes('>Retry</button>'),
      {
        code: 'appearance-accessible-retry',
        message: `${locale}: Theme choices must remain native radios with a labelled group and an announced, actionable write failure.`,
      },
    );
  });
}
