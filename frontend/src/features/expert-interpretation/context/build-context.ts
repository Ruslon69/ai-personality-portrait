import type {
  InterpretationContext,
  InterpretationRequest,
  InterpretationSourceAvailability,
} from '../types';
import { uniqueSorted } from '../utils';
import { derivePsychologicalContext } from './psychological-context';

function assertIsoTimestamp(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new Error('InterpretationContext requires a valid externally supplied timestamp.');
  }
}

export function buildInterpretationContext(request: InterpretationRequest): InterpretationContext {
  assertIsoTimestamp(request.generatedAt);
  if (!request.seed.trim()) throw new Error('InterpretationContext requires a deterministic seed.');
  if (!request.tarot.cards.length)
    throw new Error('InterpretationContext requires selected cards.');

  const psychology = derivePsychologicalContext(request.psychologyAnswers ?? []);
  const selected = uniqueSorted(
    (request.interests ?? [])
      .filter((interest) => interest.trim())
      .map((interest) => interest.trim()),
  );
  const custom = request.customInterest?.trim() || null;
  const sourceAvailability: InterpretationSourceAvailability = {
    interests: selected.length > 0 || custom !== null,
    numerology: Boolean(request.numerology),
    psychologicalContext: psychology.answers.length > 0,
    tarot: true,
    zodiac: Boolean(request.zodiac),
  };

  return {
    interests: { custom, selected },
    locale: request.locale,
    metadata: {
      deterministicSeed: request.seed,
      generatedAt: request.generatedAt,
      sourceAvailability,
    },
    numerology: request.numerology
      ? {
          masterNumbers: uniqueSorted(request.numerology.masterNumbers),
          numbers: [...request.numerology.numbers].sort((left, right) =>
            left.id.localeCompare(right.id),
          ),
          system: request.numerology.system,
        }
      : null,
    psychology,
    tarot: {
      ...request.tarot,
      cards: request.tarot.cards.map((card, index, cards) => ({
        ...card,
        neighbouringCardIds: [cards[index - 1]?.id, cards[index + 1]?.id].filter(
          (id): id is string => Boolean(id),
        ),
      })),
    },
    zodiac: request.zodiac ? { ...request.zodiac } : null,
  };
}
