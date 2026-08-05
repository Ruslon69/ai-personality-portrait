import type { SpreadStrategyId } from '../localization';

export type SpreadCompositionStrategy = {
  id: SpreadStrategyId;
  narrativeSlots: readonly string[];
};

const strategies: Readonly<Record<SpreadStrategyId, SpreadCompositionStrategy>> = {
  'card-of-the-day': {
    id: 'card-of-the-day',
    narrativeSlots: ['main-tone', 'attention-point', 'small-action', 'reflection'],
  },
  week: {
    id: 'week',
    narrativeSlots: ['opening', 'movement', 'challenge', 'support', 'synthesis'],
  },
  month: {
    id: 'month',
    narrativeSlots: ['main-theme', 'relationships', 'work', 'inner-tone', 'advice', 'synthesis'],
  },
  'compact-year': {
    id: 'compact-year',
    narrativeSlots: [
      'foundation',
      'first-stage',
      'second-stage',
      'third-stage',
      'fourth-stage',
      'integration',
    ],
  },
  love: {
    id: 'love',
    narrativeSlots: [
      'your-position',
      'relationship-dynamic',
      'connection',
      'tension',
      'conversation-focus',
    ],
  },
  'work-study': {
    id: 'work-study',
    narrativeSlots: [
      'current-situation',
      'available-strength',
      'obstacle',
      'opportunity',
      'next-step',
    ],
  },
  money: {
    id: 'money',
    narrativeSlots: [
      'current-approach',
      'available-resource',
      'blind-spot',
      'opportunity',
      'practical-boundary',
    ],
  },
  decision: {
    id: 'decision',
    narrativeSlots: ['essence', 'visible', 'overlooked', 'available-action', 'possible-direction'],
  },
};

export function resolveSpreadStrategy(spreadId: string): SpreadCompositionStrategy {
  const normalized = spreadId.toLowerCase();
  if (normalized.includes('year')) return strategies['compact-year'];
  if (normalized.includes('month')) return strategies.month;
  if (normalized.includes('week')) return strategies.week;
  if (normalized.includes('love')) return strategies.love;
  if (normalized.includes('work') || normalized.includes('study')) return strategies['work-study'];
  if (normalized.includes('money')) return strategies.money;
  if (normalized.includes('decision')) return strategies.decision;
  return strategies['card-of-the-day'];
}
