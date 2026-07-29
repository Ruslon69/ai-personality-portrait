import { env } from './env';

export const appConfig = Object.freeze({
  environment: env.appEnvironment,
  name: 'AI Personality Portrait',
  version: env.appVersion,
});
