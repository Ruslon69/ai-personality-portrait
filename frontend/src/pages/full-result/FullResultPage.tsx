import { useNotifications } from '@app/providers';
import { demoPersonalityReport, PersonalityReport } from '@features/personality-report';

export function FullResultPage() {
  const { notify } = useNotifications();

  return (
    <PersonalityReport
      onShare={() => notify('Публикация пока недоступна в демонстрационном режиме.', 'info')}
      report={demoPersonalityReport}
    />
  );
}
