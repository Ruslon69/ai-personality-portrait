import { ContentLayout } from '@app/layout';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { ButtonLink } from '@shared/ui';

export function NotFoundPage() {
  const { messages } = useI18n();

  return (
    <ContentLayout
      description={messages.system.notFound.description}
      title={messages.system.notFound.title}
    >
      <div>
        <ButtonLink href={ROUTES.home} prominence="primary">
          {messages.system.notFound.action}
        </ButtonLink>
      </div>
    </ContentLayout>
  );
}
