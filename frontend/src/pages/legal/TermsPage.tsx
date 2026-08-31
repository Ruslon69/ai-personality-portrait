import { useI18n } from '@shared/i18n';

import { LegalPage } from './LegalPage';
import { termsCopy } from './legal-copy';

export function TermsPage() {
  const { locale } = useI18n();
  return <LegalPage document={termsCopy[locale]} />;
}
