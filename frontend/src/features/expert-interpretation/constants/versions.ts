export const EXPERT_INTERPRETATION_VERSION = 'expert-interpretation-v1' as const;
export const TAROT_RULES_VERSION = 'tarot-rules-v1' as const;
export const NUMEROLOGY_RULES_VERSION = 'numerology-rules-v1' as const;
export const WORDING_VERSION = 'wording-v1' as const;
export const AUTHOR_CONTENT_VERSION = 'author-content-v1' as const;
export const NUMEROLOGY_CALCULATION_VERSION = 'pythagorean-date-v1' as const;

export const EXPERT_INTERPRETATION_VERSIONS = {
  content: AUTHOR_CONTENT_VERSION,
  engine: EXPERT_INTERPRETATION_VERSION,
  numerology: NUMEROLOGY_RULES_VERSION,
  numerologyCalculation: NUMEROLOGY_CALCULATION_VERSION,
  tarot: TAROT_RULES_VERSION,
  wording: WORDING_VERSION,
} as const;
