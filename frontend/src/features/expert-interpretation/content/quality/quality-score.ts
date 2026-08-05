import type {
  AuthorInterpretationContent,
  ContentQualityIssue,
  ContentQualityReport,
  InterpretationEvidence,
} from '../../types';
import { classifyUnsafeClaims } from '../safeguards';

export const MIN_CONTENT_QUALITY_SCORE = 78;

function allTexts(content: AuthorInterpretationContent) {
  return [
    content.headline,
    content.opening,
    content.closing,
    ...content.sections.flatMap((section) => [
      section.headline,
      section.opening ?? '',
      section.closing ?? '',
      ...section.blocks.map((block) => block.text),
    ]),
  ].filter(Boolean);
}

function localizationScore(content: AuthorInterpretationContent) {
  const text = allTexts(content).join(' ');
  if (content.locale === 'en') return /[А-Яа-яЁёІіЇїЄєҐґ]/u.test(text) ? 0 : 100;
  return /[А-Яа-яЁёІіЇїЄєҐґ]/u.test(text) ? 100 : 0;
}

export function scoreContentQuality(
  content: AuthorInterpretationContent,
  evidence: readonly InterpretationEvidence[],
  issues: readonly ContentQualityIssue[],
  mergedSectionIds: readonly string[],
  replacements: readonly string[],
): ContentQualityReport {
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const blocks = content.sections.flatMap((section) => section.blocks);
  const emptyCount = allTexts(content).filter((text) => !text.trim()).length;
  const ungrounded = blocks.filter(
    (block) => !block.evidenceIds.length || block.evidenceIds.some((id) => !evidenceIds.has(id)),
  ).length;
  const unsafeCount = allTexts(content).reduce(
    (total, text) => total + classifyUnsafeClaims(text).length,
    0,
  );
  const sectionSizes = content.sections.map((section) => section.blocks.length);
  const unbalanced = sectionSizes.filter((size) => size < 3 || size > 8).length;
  const generic = blocks.filter((block) => block.text.trim().split(/\s+/u).length < 5).length;
  const repetitionIssues = issues.filter((issue) =>
    [
      'duplicate-headline',
      'duplicate-practical-focus',
      'repeated-card-name',
      'repeated-opening',
      'repeated-phrase',
      'semantic-duplicate',
    ].includes(issue.kind),
  ).length;
  const score = {
    claimSafety: Math.max(0, 100 - unsafeCount * 100),
    completeness: Math.max(0, 100 - emptyCount * 30 - (content.sections.length ? 0 : 100)),
    localizationCompleteness: localizationScore(content),
    repetition: Math.max(0, 100 - repetitionIssues * 4),
    sectionBalance: Math.max(0, 100 - unbalanced * 12),
    sourceGrounding: Math.max(0, 100 - ungrounded * 20),
    specificity: Math.max(0, 100 - generic * 12),
  };
  const overall = Math.round(
    (score.claimSafety * 2 +
      score.completeness +
      score.localizationCompleteness +
      score.repetition +
      score.sectionBalance +
      score.sourceGrounding * 2 +
      score.specificity) /
      9,
  );
  const report: ContentQualityReport = {
    issues,
    mergedSectionIds,
    replacements,
    score: { ...score, overall },
    threshold: MIN_CONTENT_QUALITY_SCORE,
    valid:
      overall >= MIN_CONTENT_QUALITY_SCORE &&
      score.claimSafety === 100 &&
      score.localizationCompleteness === 100 &&
      score.sourceGrounding === 100,
  };
  return report;
}
