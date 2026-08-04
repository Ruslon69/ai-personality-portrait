import {
  createNumerologyProfile,
  loadNumerologyBirthDate,
  NumerologyForm,
  NumerologyResult,
  saveNumerologyBirthDate,
} from '@features/numerology';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function NumerologyResultPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const date = loadNumerologyBirthDate();
  if (!date)
    return (
      <NumerologyForm
        locale={locale}
        onSubmit={(value) => {
          saveNumerologyBirthDate(value);
          navigate(ROUTES.numerologyResult, { replace: true });
        }}
      />
    );
  return (
    <NumerologyResult
      locale={locale}
      onBack={() => navigate(ROUTES.numerology)}
      profile={createNumerologyProfile(date, locale)}
    />
  );
}
