import { createContext } from 'react';

import type { NotificationContextValue } from './NotificationProvider.types';

export const NotificationContext = createContext<NotificationContextValue | null>(null);
