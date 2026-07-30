import { ContentLayout } from '@app/layout';
import { useI18n } from '@shared/i18n';

export function CompatibilityPage() {
  const { messages } = useI18n();

  return (
    <ContentLayout
      description={messages.system.compatibility.description}
      title={messages.system.compatibility.title}
    />
  );
}
