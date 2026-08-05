import type { AuthorInterpretationContent, InterpretationEvidence } from '../../types';
import type { ContentDictionary } from '../localization';
import { replaceUnsafeClaims } from '../safeguards';
import { controlContentRepetition } from './repetition-control';
import { scoreContentQuality } from './quality-score';

export function finalizeAuthorContent(
  initial: AuthorInterpretationContent,
  dictionary: ContentDictionary,
  evidence: readonly InterpretationEvidence[],
  fingerprint: string,
): AuthorInterpretationContent {
  const safe = replaceUnsafeClaims(initial, dictionary);
  const repetition = controlContentRepetition(safe.content, dictionary, fingerprint);
  const quality = scoreContentQuality(
    repetition.content,
    evidence,
    repetition.issues,
    repetition.mergedSectionIds,
    [...safe.replacements, ...repetition.replacements],
  );
  return { ...repetition.content, quality };
}
