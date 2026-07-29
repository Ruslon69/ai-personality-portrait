import { readEnumEnv, readNumberEnv, readStringEnv } from '@shared/lib/env';

export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

const environmentValues: readonly AppEnvironment[] = [
  'development',
  'staging',
  'production',
  'test',
];

export const env = Object.freeze({
  apiBaseUrl: readStringEnv(import.meta.env, 'VITE_API_BASE_URL', 'http://127.0.0.1:8000'),
  apiTimeoutMs: readNumberEnv(import.meta.env, 'VITE_API_TIMEOUT_MS', 10_000),
  appEnvironment: readEnumEnv(import.meta.env, 'VITE_APP_ENV', environmentValues, 'development'),
  appVersion: readStringEnv(import.meta.env, 'VITE_APP_VERSION', '0.0.0'),
});
