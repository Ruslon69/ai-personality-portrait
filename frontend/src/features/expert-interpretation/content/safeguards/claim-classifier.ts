import type { AuthorInterpretationContent } from '../../types';
import type { ContentDictionary } from '../localization';

export type UnsafeClaimCategory =
  | 'exact-event-date'
  | 'financial-promise'
  | 'future-guarantee'
  | 'human-specialist'
  | 'inevitable-relationship-event'
  | 'legal-advice'
  | 'medical-diagnosis'
  | 'mind-reading'
  | 'pregnancy'
  | 'severe-harm'
  | 'winning';

export type UnsafeClaim = {
  category: UnsafeClaimCategory;
  match: string;
};

const claimPatterns: readonly [UnsafeClaimCategory, RegExp][] = [
  [
    'future-guarantee',
    /(?:обязательно произойд[её]т|гарантированно случится|точно произойд[её]т|will definitely happen|is guaranteed to happen|обов['’]язково станеться|гарантовано станеться)/giu,
  ],
  [
    'medical-diagnosis',
    /(?:у тебя диагноз|ты страдаешь от|you have (?:a )?diagnosis|you suffer from|у тебе діагноз|ти страждаєш від)/giu,
  ],
  [
    'legal-advice',
    /(?:юридически тебе следует|по закону ты обязан|legally you must|legal advice is|юридично тобі слід|за законом ти зобов['’]язаний)/giu,
  ],
  [
    'financial-promise',
    /(?:гарантирует доход|точно получишь деньги|guarantees? (?:income|profit)|you will definitely make money|гарантує дохід|точно отримаєш гроші)/giu,
  ],
  [
    'mind-reading',
    /(?:он(?:а)? точно думает|я знаю его мысли|they definitely think|she definitely thinks|he definitely thinks|він точно думає|вона точно думає)/giu,
  ],
  [
    'inevitable-relationship-event',
    /(?:вы обязательно расстанетесь|вы точно встретитесь|you will inevitably (?:break up|meet)|you will definitely (?:break up|meet)|ви обов['’]язково розлучитеся|ви точно зустрінетеся)/giu,
  ],
  [
    'pregnancy',
    /(?:ты точно беременна|беременность гарантирована|you are definitely pregnant|pregnancy is guaranteed|ти точно вагітна|вагітність гарантована)/giu,
  ],
  [
    'severe-harm',
    /(?:ты умр[её]шь|смерть неизбежна|тяж[её]лая болезнь неизбежна|you will die|death is inevitable|severe illness is inevitable|ти помреш|смерть неминуча|тяжка хвороба неминуча)/giu,
  ],
  [
    'winning',
    /(?:ты точно выиграешь|выигрыш гарантирован|you will definitely win|a win is guaranteed|ти точно виграєш|виграш гарантований)/giu,
  ],
  [
    'exact-event-date',
    /(?:событие произойд[её]т \d{1,2}[./-]\d{1,2}|the event will happen on \d{1,2}[./-]\d{1,2}|подія станеться \d{1,2}[./-]\d{1,2})/giu,
  ],
  [
    'human-specialist',
    /(?:профессиональный таролог (?:пров[её]л|сделал)|специалист пров[её]л|a professional tarot reader (?:analysed|analyzed|prepared)|a specialist prepared|професійний таролог (?:провів|зробив)|фахівець провів)/giu,
  ],
];

export function classifyUnsafeClaims(text: string): readonly UnsafeClaim[] {
  return claimPatterns.flatMap(([category, pattern]) => {
    pattern.lastIndex = 0;
    return [...text.matchAll(pattern)].map((match) => ({ category, match: match[0] }));
  });
}

function fallbackFor(category: UnsafeClaimCategory, dictionary: ContentDictionary) {
  if (category === 'mind-reading' || category === 'inevitable-relationship-event') {
    return dictionary.safeFallback.conversation;
  }
  if (
    [
      'financial-promise',
      'legal-advice',
      'medical-diagnosis',
      'pregnancy',
      'severe-harm',
      'winning',
    ].includes(category)
  ) {
    return dictionary.safeFallback.boundary;
  }
  return dictionary.safeFallback.reflection;
}

export function replaceUnsafeClaims(
  content: AuthorInterpretationContent,
  dictionary: ContentDictionary,
): { content: AuthorInterpretationContent; replacements: readonly string[] } {
  const replacements: string[] = [];
  const safe = (text: string, path: string) => {
    const claims = classifyUnsafeClaims(text);
    if (!claims.length) return text;
    replacements.push(`${path}:${claims.map((claim) => claim.category).join(',')}`);
    return fallbackFor(claims[0]?.category ?? 'future-guarantee', dictionary);
  };
  return {
    content: {
      ...content,
      closing: safe(content.closing, 'closing'),
      headline: safe(content.headline, 'headline'),
      opening: safe(content.opening, 'opening'),
      sections: content.sections.map((section, sectionIndex) => ({
        ...section,
        ...(section.closing
          ? { closing: safe(section.closing, `sections.${sectionIndex}.closing`) }
          : {}),
        headline: safe(section.headline, `sections.${sectionIndex}.headline`),
        ...(section.opening
          ? { opening: safe(section.opening, `sections.${sectionIndex}.opening`) }
          : {}),
        blocks: section.blocks.map((block, blockIndex) => ({
          ...block,
          text: safe(block.text, `sections.${sectionIndex}.blocks.${blockIndex}`),
        })),
      })),
    },
    replacements,
  };
}
