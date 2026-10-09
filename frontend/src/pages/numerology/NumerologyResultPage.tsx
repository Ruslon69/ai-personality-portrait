import { useState } from 'react';

import { NumerologyForm, NumerologyResult, numerologyResultSession } from '@features/numerology';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function NumerologyResultPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const [result, setResult] = useState(() => numerologyResultSession.get(locale));
  if (!result)
    return (
      <NumerologyForm
        locale={locale}
        onSubmit={(date) => setResult(numerologyResultSession.submit(date, locale))}
      />
    );
  return (
    <NumerologyResult
      locale={locale}
      onBack={() => navigate(ROUTES.numerology)}
      profile={result.profile}
      referenceDate={result.referenceDate}
      persistenceFailed={!result.persisted}
      onRetrySave={() => setResult(numerologyResultSession.retry())}
    />
  );
}
