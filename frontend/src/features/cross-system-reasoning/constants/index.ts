import type { CrossSystemVersions } from '../types';

export const CROSS_SYSTEM_VERSIONS: CrossSystemVersions = {
  contrast: 'contrast-rules-v1',
  convergence: 'convergence-rules-v1',
  engine: 'cross-system-reasoning-v1',
  resonance: 'resonance-rules-v1',
  sourceHierarchy: 'source-hierarchy-v1',
};

export const CROSS_SYSTEM_DISPLAY_THRESHOLD = 58;

export const CROSS_SYSTEM_SOURCE_PRIORITY = {
  'tarot-position': 100,
  'tarot-connection': 92,
  'psychological-context': 84,
  'numerology-period': 76,
  'numerology-advanced': 72,
  'journey-memory': 68,
  'numerology-core': 60,
  interest: 28,
  zodiac: 20,
  'tarot-card': 96,
} as const;

export const CROSS_SYSTEM_CONTRAST_PAIRS = [
  ['movement', 'pause'],
  ['freedom', 'structure'],
  ['clarity', 'uncertainty'],
  ['growth', 'boundaries'],
  ['connection', 'boundaries'],
  ['action', 'reflection'],
  ['stability', 'transition'],
  ['expression', 'reflection'],
] as const;
