import type { AppEnvironment } from '@shared/config';

import { apiClient } from './client';

export type HealthResponse = {
  environment: AppEnvironment;
  status: 'ok';
  timestamp: string;
  version: string;
};

export function getHealth(signal?: AbortSignal) {
  return apiClient.get<HealthResponse>('/health', { signal });
}
