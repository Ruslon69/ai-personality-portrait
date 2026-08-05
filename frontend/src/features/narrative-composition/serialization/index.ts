import type { NarrativeComposition } from '../types';
import { stableNarrativeStringify } from '../utils';
import { validateNarrativeComposition } from '../validation';

export function serializeNarrativeComposition(composition: NarrativeComposition): string {
  const validation = validateNarrativeComposition(composition);
  if (!validation.valid)
    throw new Error(
      `Cannot serialize invalid narrative: ${validation.errors[0]?.message ?? 'unknown error'}`,
    );
  return stableNarrativeStringify(composition);
}

export function deserializeNarrativeComposition(serialized: string): NarrativeComposition {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('Serialized narrative must contain an object.');
  const composition = parsed as NarrativeComposition;
  const validation = validateNarrativeComposition(composition);
  if (!validation.valid)
    throw new Error(
      `Invalid serialized narrative: ${validation.errors[0]?.message ?? 'unknown error'}`,
    );
  return composition;
}
