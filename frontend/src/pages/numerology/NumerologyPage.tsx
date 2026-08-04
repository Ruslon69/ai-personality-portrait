import { NumerologyForm, saveNumerologyBirthDate } from '@features/numerology';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function NumerologyPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <NumerologyForm
      locale={locale}
      onSubmit={(date) => {
        saveNumerologyBirthDate(date);
        navigate(ROUTES.numerologyResult);
      }}
    />
  );
}
