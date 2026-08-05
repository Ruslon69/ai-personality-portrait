import type { ProductStorageFeatureFlag } from '../types';

export function resolveProductStorageFeatureFlag(input: {
  environment: 'development' | 'production' | 'staging' | 'test';
  rawValue?: string;
}): ProductStorageFeatureFlag {
  if (input.rawValue === 'true')
    return { enabled: true, name: 'productStorageV2', source: 'environment' };
  if (input.rawValue === 'false')
    return { enabled: false, name: 'productStorageV2', source: 'environment' };
  const enabled = input.environment === 'development' || input.environment === 'test';
  return {
    enabled,
    name: 'productStorageV2',
    source: enabled ? 'default-development' : 'default-production',
  };
}
