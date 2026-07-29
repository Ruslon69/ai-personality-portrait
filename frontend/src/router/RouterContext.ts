import { createContext } from 'react';

import type { RouterContextValue } from './RouterProvider.types';

export const RouterContext = createContext<RouterContextValue | null>(null);
