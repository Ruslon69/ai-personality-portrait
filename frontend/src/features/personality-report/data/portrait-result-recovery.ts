import { ROUTES } from '@shared/config';
import type { Locale } from '@shared/i18n';

type PortraitRecoveryCopy = {
  action: string;
  description: string;
  title: string;
};

export const portraitRecoveryCopy: Record<Locale, PortraitRecoveryCopy> = {
  en: {
    action: 'Return to Portrait',
    description:
      'This result is no longer available in the current session. Your portrait stays private and is not stored after the session ends.',
    title: 'Your portrait is no longer available',
  },
  ru: {
    action: 'Вернуться к Портрету',
    description:
      'Этот результат больше недоступен в текущей сессии. Портрет остаётся приватным и не сохраняется после завершения сессии.',
    title: 'Портрет больше недоступен',
  },
  uk: {
    action: 'Повернутися до Портрета',
    description:
      'Цей результат більше недоступний у поточній сесії. Портрет залишається приватним і не зберігається після завершення сесії.',
    title: 'Портрет більше недоступний',
  },
};

export type PortraitResultAvailability<T> =
  { kind: 'available'; profile: T } | { actionHref: typeof ROUTES.portrait; kind: 'missing' };

export function resolvePortraitResultAvailability<T>(
  profile: T | null,
): PortraitResultAvailability<T> {
  return profile
    ? { kind: 'available', profile }
    : { actionHref: ROUTES.portrait, kind: 'missing' };
}
