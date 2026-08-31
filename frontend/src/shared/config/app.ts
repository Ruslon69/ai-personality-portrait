import { env } from './env';
import { productBrand } from './brand';

export const appConfig = Object.freeze({
  brand: productBrand,
  environment: env.appEnvironment,
  name: productBrand.name,
  version: env.appVersion,
});
