import {
  loadNumerologyBirthDate,
  NumerologyForm,
  numerologyResultSession,
} from '@features/numerology';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function NumerologyPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <NumerologyForm
      initialBirthDate={loadNumerologyBirthDate()}
      locale={locale}
      onSubmit={(date) => {
        numerologyResultSession.submit(date, locale);
        navigate(ROUTES.numerologyResult);
      }}
    />
  );
}
