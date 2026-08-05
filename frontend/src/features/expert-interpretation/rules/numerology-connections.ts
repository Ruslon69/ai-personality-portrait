import { MASTER_NUMBERS } from '@features/numerology';
import type {
  InterpretationConnection,
  InterpretationContext,
  InterpretationNumerologyNumberInput,
  InterpretationSignal,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

function reducedDigit(value: number) {
  if (MASTER_NUMBERS.includes(value as 11 | 22 | 33)) return value;
  let current = Math.abs(value);
  while (current > 9) {
    current = String(current)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function evidenceFor(
  evidence: readonly InterpretationSignal[],
  cardIds: readonly string[],
  numberIds: readonly string[],
) {
  return uniqueSorted(
    evidence
      .filter(
        (item) =>
          (item.reference?.kind === 'card' && cardIds.includes(item.reference.id)) ||
          (item.reference?.kind === 'number' && numberIds.includes(item.reference.id)),
      )
      .map((item) => item.id),
  );
}

function createConnection(input: {
  cardIds?: readonly string[];
  evidence: readonly InterpretationSignal[];
  kind: InterpretationConnection['kind'];
  numberIds: readonly string[];
  numberValues: readonly number[];
  semanticId: string;
  strength: InterpretationConnection['strength'];
}): InterpretationConnection {
  const cardIds = input.cardIds ?? [];
  return {
    cardIds,
    evidenceIds: evidenceFor(input.evidence, cardIds, input.numberIds),
    id: stableId('connection', {
      cardIds,
      numberIds: input.numberIds,
      semanticId: input.semanticId,
    }),
    kind: input.kind,
    numberValues: uniqueSorted(input.numberValues),
    semanticId: input.semanticId,
    source: 'numerology',
    strength: input.strength,
  };
}

function findNumber(
  numbers: readonly InterpretationNumerologyNumberInput[],
  id: InterpretationNumerologyNumberInput['id'],
) {
  return numbers.find((number) => number.id === id);
}

export function resolveNumerologyConnections(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
): readonly InterpretationConnection[] {
  if (!context.numerology) return [];
  const numbers = context.numerology.numbers;
  const connections: InterpretationConnection[] = [];
  const lifePath = findNumber(numbers, 'life-path');
  const birthday = findNumber(numbers, 'birthday');
  if (lifePath && birthday) {
    const same = reducedDigit(lifePath.value) === reducedDigit(birthday.value);
    connections.push(
      createConnection({
        evidence,
        kind: same ? 'reinforcement' : 'contrast',
        numberIds: [lifePath.id, birthday.id],
        numberValues: [lifePath.value, birthday.value],
        semanticId: same ? 'numerology.core-resonance' : 'numerology.core-distinct-lenses',
        strength: 'secondary',
      }),
    );
  }

  const periods = (['personal-year', 'personal-month', 'personal-day'] as const)
    .map((id) => findNumber(numbers, id))
    .filter((number): number is InterpretationNumerologyNumberInput => Boolean(number));
  periods.forEach((number, index) => {
    connections.push(
      createConnection({
        evidence,
        kind: index === 0 ? 'progression' : 'practical-direction',
        numberIds: [number.id],
        numberValues: [number.value],
        semanticId: `numerology.period.${number.id}.${number.value}`,
        strength: index === 0 ? 'primary' : 'contextual',
      }),
    );
  });

  const repeatedValues = new Map<number, InterpretationNumerologyNumberInput[]>();
  numbers.forEach((number) => {
    const current = repeatedValues.get(number.value) ?? [];
    repeatedValues.set(number.value, [...current, number]);
  });
  repeatedValues.forEach((matchingNumbers, value) => {
    if (matchingNumbers.length < 2) return;
    connections.push(
      createConnection({
        evidence,
        kind: 'reinforcement',
        numberIds: matchingNumbers.map((number) => number.id),
        numberValues: [value],
        semanticId: `numerology.repeated-pattern.${value}`,
        strength: 'secondary',
      }),
    );
  });

  context.tarot.cards.forEach((card) => {
    numbers.forEach((number) => {
      if (
        card.number === number.value ||
        reducedDigit(card.number) === reducedDigit(number.value)
      ) {
        connections.push(
          createConnection({
            cardIds: [card.id],
            evidence,
            kind: 'reinforcement',
            numberIds: [number.id],
            numberValues: [card.number, number.value],
            semanticId: `numerology.card-number-link.${number.id}.${card.number}`,
            strength: card.number === number.value ? 'secondary' : 'contextual',
          }),
        );
      }
    });
  });

  context.numerology.masterNumbers.forEach((value) => {
    const numberIds = numbers.filter((number) => number.value === value).map((number) => number.id);
    if (!numberIds.length) return;
    connections.push(
      createConnection({
        evidence,
        kind: 'reinforcement',
        numberIds,
        numberValues: [value],
        semanticId: `numerology.master-number.${value}`,
        strength: 'secondary',
      }),
    );
  });

  return [...new Map(connections.map((item) => [item.id, item])).values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}
