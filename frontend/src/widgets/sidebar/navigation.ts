import { ROUTES } from '@shared/config';

export const navigationItems = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Portrait', path: ROUTES.portrait },
  { label: 'Compatibility', path: ROUTES.compatibility },
  { label: 'Profile', path: ROUTES.profile },
  { label: 'Settings', path: ROUTES.settings },
] as const;
