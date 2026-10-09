import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { ButtonLink } from '@shared/ui';

import { SystemState } from './SystemState';

export function NotFoundPage() {
  const { messages } = useI18n();

  return (
    <SystemState
      action={
        <ButtonLink href={ROUTES.home} prominence="primary" size="large">
          {messages.system.notFound.action}
        </ButtonLink>
      }
      code="404"
      description={messages.system.notFound.description}
      title={messages.system.notFound.title}
    />
  );
}
