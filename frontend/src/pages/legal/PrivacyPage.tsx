import { useI18n } from '@shared/i18n';

import { LegalPage } from './LegalPage';
import { privacyPolicyCopy } from './legal-copy';

export function PrivacyPage() {
  const { locale } = useI18n();
  return <LegalPage document={privacyPolicyCopy[locale]} />;
}
