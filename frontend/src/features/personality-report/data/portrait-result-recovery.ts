import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { ROUTES } from '@shared/config';
import type { Locale } from '@shared/i18n';

type PortraitRecoveryCopy = {
  action: string;
  description: string;
  title: string;
};

export const portraitRecoveryCopy: Record<Locale, PortraitRecoveryCopy> = {
  es: {
    action: 'Volver a Retrato',
    description: productContractCopy.es.portraitMissing,
    title: 'Tu retrato ya no está disponible',
  },
  en: {
    action: 'Return to Portrait',
    description: productContractCopy.en.portraitMissing,
    title: 'Your portrait is no longer available',
  },
  ru: {
    action: 'Вернуться к Портрету',
    description: productContractCopy.ru.portraitMissing,
    title: 'Портрет больше недоступен',
  },
  uk: {
    action: 'Повернутися до Портрета',
    description: productContractCopy.uk.portraitMissing,
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
