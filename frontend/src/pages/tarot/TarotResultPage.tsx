import { TarotResult, useTarotSession } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Container, Stack, Typography } from '@shared/ui';

export function TarotResultPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { actions, state } = useTarotSession();
  if (!state.reading)
    return (
      <Container size="default">
        <Stack align="start" gap="lg">
          <Typography as="h1" variant="heading-lg">
            {locale === 'en'
              ? 'Create a reading first'
              : locale === 'uk'
                ? 'Спочатку створіть розклад'
                : 'Сначала создайте расклад'}
          </Typography>
          <Button onClick={() => navigate(ROUTES.tarot)} prominence="primary">
            {locale === 'en'
              ? 'Go to Tarot'
              : locale === 'uk'
                ? 'Перейти до Таро'
                : 'Перейти к Таро'}
          </Button>
        </Stack>
      </Container>
    );
  return (
    <TarotResult
      locale={locale}
      onContinueJourney={() => navigate(ROUTES.profile)}
      onRestart={() => {
        actions.reset();
        navigate(ROUTES.tarot);
      }}
      reading={state.reading}
    />
  );
}
