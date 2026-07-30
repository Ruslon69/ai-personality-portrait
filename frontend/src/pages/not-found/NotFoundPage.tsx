import { ContentLayout } from '@app/layout';
import { useI18n } from '@shared/i18n';

export function NotFoundPage() {
  const { messages } = useI18n();

  return (
    <ContentLayout
      description={messages.system.notFound.description}
      title={messages.system.notFound.title}
    />
  );
}
