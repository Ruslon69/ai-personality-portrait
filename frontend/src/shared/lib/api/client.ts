import { env } from '@shared/config';
import { logger } from '@shared/lib/logger';

import { ApiClient } from './ApiClient';

export const apiClient = new ApiClient({
  baseUrl: env.apiBaseUrl,
  timeoutMs: env.apiTimeoutMs,
});

apiClient.addRequestInterceptor((request) => {
  const headers = new Headers(request.init.headers);
  headers.set('Accept', 'application/json');

  return {
    ...request,
    init: {
      ...request.init,
      headers,
    },
  };
});

apiClient.addErrorInterceptor((error) => {
  logger.error('API request failed', {
    code: error.code,
    status: error.status,
  });
});
