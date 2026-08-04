import { ROUTES } from '@shared/config';

export const navigationItems = [
  { labelKey: 'home', path: ROUTES.home },
  { labelKey: 'tarot', path: ROUTES.tarot },
  { labelKey: 'numerology', path: ROUTES.numerology },
  { labelKey: 'portrait', path: ROUTES.portrait },
  { exact: true, labelKey: 'profile', path: ROUTES.profile },
  { labelKey: 'myPath', path: ROUTES.profileHistory },
  { labelKey: 'settings', path: ROUTES.settings },
] as const;
