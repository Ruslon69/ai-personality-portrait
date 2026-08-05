export const PSYCHOLOGICAL_THEME_MAPPINGS: Readonly<Record<string, readonly string[]>> = {
  'decision.evidence-led': ['clarity', 'structure'],
  'decision.dialogue-supported': ['connection', 'communication'],
  'decision.iterative': ['movement', 'adaptation'],
  'decision.reflective': ['pause', 'reflection'],
  'uncertainty.maps-options': ['structure', 'clarity'],
  'uncertainty.learns-through-action': ['movement', 'action'],
  'uncertainty.waits-for-signal': ['pause', 'reflection'],
  'uncertainty.checks-urgency': ['clarity', 'boundaries'],
  'change.keeps-anchor': ['stability', 'structure'],
  'change.needs-space': ['boundaries', 'pause'],
  'change.reframes-quickly': ['change', 'movement'],
  'change.uses-dialogue': ['connection', 'communication'],
};

export const ZODIAC_THEME_MAPPINGS = {
  element: {
    air: ['clarity', 'communication'],
    earth: ['stability', 'structure'],
    fire: ['action', 'movement'],
    water: ['connection', 'reflection'],
  },
  modality: {
    cardinal: ['action', 'change'],
    fixed: ['stability', 'boundaries'],
    mutable: ['change', 'adaptation'],
  },
} as const;

export const SUIT_THEME_MAPPINGS = {
  cups: ['connection', 'reflection'],
  pentacles: ['stability', 'structure'],
  swords: ['clarity', 'decision'],
  wands: ['action', 'movement'],
} as const;

export const POSITION_THEME_MAPPINGS: Readonly<Record<string, readonly string[]>> = {
  advice: ['reflection', 'decision'],
  hidden: ['uncertainty', 'reflection'],
  obstacle: ['boundaries', 'uncertainty'],
  opportunity: ['growth', 'movement'],
  outcome: ['transition', 'decision'],
  resource: ['support', 'stability'],
  support: ['support', 'connection'],
};
