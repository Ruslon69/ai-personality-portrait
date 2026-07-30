import { ROUTES } from '@shared/config';

export const navigationItems = [
  { labelKey: 'home', path: ROUTES.home },
  { labelKey: 'portrait', path: ROUTES.portrait },
  { labelKey: 'compatibility', path: ROUTES.compatibility },
  { labelKey: 'profile', path: ROUTES.profile },
  { labelKey: 'settings', path: ROUTES.settings },
] as const;
