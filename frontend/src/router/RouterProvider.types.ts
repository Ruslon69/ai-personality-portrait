import type { ComponentType, PropsWithChildren } from 'react';

import type { AppRoutePath } from '@shared/config';

export type NavigateOptions = {
  replace?: boolean;
};

export type AppRoute = {
  component: ComponentType;
  path: AppRoutePath;
};

export type RouterContextValue = {
  currentPath: string;
  navigate: (path: AppRoutePath, options?: NavigateOptions) => void;
};

export type RouterProviderProps = PropsWithChildren;
