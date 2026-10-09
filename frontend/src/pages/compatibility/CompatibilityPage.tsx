import { SystemState } from '@pages/not-found/SystemState';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button } from '@shared/ui';

export function CompatibilityPage() {
  const { messages } = useI18n();
  const { navigate } = useRouter();

  return (
    <SystemState
      action={
        <Button onClick={() => navigate(ROUTES.home)} prominence="primary" size="large">
          {messages.system.compatibility.action}
        </Button>
      }
      code="Soul Arkana"
      description={messages.system.compatibility.description}
      title={messages.system.compatibility.title}
    />
  );
}
