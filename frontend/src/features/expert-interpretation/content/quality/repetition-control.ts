import type {
  AuthorInterpretationContent,
  AuthorInterpretationSection,
  ContentQualityIssue,
} from '../../types';
import { stableId } from '../../utils';
import { firstWord } from '../grammar';
import type { ContentDictionary } from '../localization';
import { selectVariation } from '../variation';

function normalized(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[“”«»'’.,:;!?—-]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function mergeSemanticDuplicates(sections: readonly AuthorInterpretationSection[]) {
  const seen = new Map<string, AuthorInterpretationSection>();
  const mergedSectionIds: string[] = [];
  sections.forEach((section) => {
    const existing = seen.get(section.sectionId);
    if (!existing) {
      seen.set(section.sectionId, section);
      return;
    }
    mergedSectionIds.push(section.id);
    const blockBySignature = new Map(
      [...existing.blocks, ...section.blocks].map((block) => [
        `${block.kind}:${normalized(block.text)}`,
        block,
      ]),
    );
    seen.set(section.sectionId, { ...existing, blocks: [...blockBySignature.values()] });
  });
  return { mergedSectionIds, sections: [...seen.values()] };
}

export function controlContentRepetition(
  content: AuthorInterpretationContent,
  dictionary: ContentDictionary,
  fingerprint: string,
): {
  content: AuthorInterpretationContent;
  issues: readonly ContentQualityIssue[];
  mergedSectionIds: readonly string[];
  replacements: readonly string[];
} {
  const issues: ContentQualityIssue[] = [];
  const replacements: string[] = [];
  const merged = mergeSemanticDuplicates(content.sections);
  const headlines = new Set<string>();
  let previousOpeningWord = firstWord(content.opening);
  const practicalTexts = new Set<string>();

  const sections = merged.sections.map((section, sectionIndex) => {
    let headline = section.headline;
    const headlineKey = normalized(headline);
    if (headlines.has(headlineKey)) {
      issues.push({
        kind: 'duplicate-headline',
        message: 'A repeated section headline was differentiated without changing its focus.',
        path: `sections.${sectionIndex}.headline`,
      });
      headline = `${selectVariation(dictionary.transitions, `${fingerprint}:headline:${section.id}`)}: ${headline.toLocaleLowerCase()}`;
      replacements.push(`headline:${section.id}`);
    }
    headlines.add(normalized(headline));

    let opening = section.opening;
    if (opening && firstWord(opening) === previousOpeningWord) {
      issues.push({
        kind: 'repeated-opening',
        message: 'Adjacent openings started identically and were varied.',
        path: `sections.${sectionIndex}.opening`,
      });
      opening = `${selectVariation(dictionary.transitions, `${fingerprint}:opening:${section.id}`)}, ${opening.charAt(0).toLocaleLowerCase()}${opening.slice(1)}`;
      replacements.push(`opening:${section.id}`);
    }
    if (opening) previousOpeningWord = firstWord(opening);

    const blocks = section.blocks.filter((block) => {
      if (block.kind !== 'practical-focus') return true;
      const key = normalized(block.text);
      if (!practicalTexts.has(key)) {
        practicalTexts.add(key);
        return true;
      }
      issues.push({
        kind: 'duplicate-practical-focus',
        message: 'A duplicate practical focus was removed.',
        path: `sections.${sectionIndex}.blocks.${block.id}`,
      });
      replacements.push(`practical:${block.id}`);
      return false;
    });

    return {
      ...section,
      blocks,
      headline,
      ...(opening ? { opening } : {}),
    };
  });

  if (merged.mergedSectionIds.length) {
    merged.mergedSectionIds.forEach((id) =>
      issues.push({
        kind: 'semantic-duplicate',
        message: 'A semantic duplicate section was merged.',
        path: `sections.${stableId('merged', id)}`,
      }),
    );
  }

  return {
    content: { ...content, sections },
    issues,
    mergedSectionIds: merged.mergedSectionIds,
    replacements,
  };
}
