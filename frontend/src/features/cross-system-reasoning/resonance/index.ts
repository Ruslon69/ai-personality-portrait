import { authorNumerologyKnowledgeBase } from '@features/numerology-knowledge';
import { createCrossSystemLink } from '../model/create-link';
import type {
  CrossSystemInput,
  CrossSystemResonance,
  CrossSystemSignal,
  CrossSystemSource,
} from '../types';
import { canonicalTheme } from '../utils';

function signalForEntity(
  signals: readonly CrossSystemSignal[],
  kind: 'card' | 'number',
  id: string,
  semanticPrefix?: string,
) {
  return signals.find(
    (signal) =>
      signal.entityReferences.some((reference) => reference.kind === kind && reference.id === id) &&
      (!semanticPrefix || signal.semanticType.startsWith(semanticPrefix)),
  );
}

export function resolveCrossSystemResonances(input: {
  reasoningInput: CrossSystemInput;
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
}): readonly CrossSystemResonance[] {
  const { reasoningInput, signals, sources } = input;
  if (!reasoningInput.context.numerology) return [];
  const results: CrossSystemResonance[] = [];
  const numbers = reasoningInput.context.numerology.numbers;
  const cards = reasoningInput.context.tarot.cards;

  authorNumerologyKnowledgeBase.tarotResonances.forEach((mapping) => {
    const matchingNumbers = numbers.filter((number) => number.value === mapping.value);
    const matchingCards = cards.filter((card) => mapping.cardIds.includes(card.id));
    matchingNumbers.forEach((number) =>
      matchingCards.forEach((card) => {
        const numberSignal = signalForEntity(
          signals,
          'number',
          `${number.id}:${number.value}`,
          'number.',
        );
        const cardSignal = signalForEntity(signals, 'card', card.id, 'tarot.meaning');
        if (!numberSignal || !cardSignal) return;
        const period = number.id.startsWith('personal-');
        const semanticType = period ? 'period-resonance' : 'direct-resonance';
        const hasProvenance =
          [...cardSignal.evidenceReferences, ...numberSignal.evidenceReferences].length > 0;
        results.push(
          createCrossSystemLink({
            direction:
              mapping.kind === 'balances' || mapping.kind === 'grounds'
                ? 'balances'
                : mapping.kind === 'opens'
                  ? 'redirects'
                  : 'reinforces',
            displayEligible: hasProvenance,
            exclusionReason: hasProvenance ? null : 'missing-provenance',
            priority: period ? 88 : number.id === 'life-path' ? 80 : 72,
            semanticType,
            signals: [cardSignal, numberSignal],
            sources,
            strength: period ? 'primary' : 'secondary',
            themeId: canonicalTheme(mapping.reasonTags[0] ?? `number-${mapping.value}`),
            uncertainty: 'symbolic-interpretation',
          }) as CrossSystemResonance,
        );
      }),
    );
  });

  reasoningInput.connections
    .filter(
      (connection) =>
        connection.source === 'numerology' &&
        connection.semanticId.startsWith('numerology.card-number-link.'),
    )
    .forEach((connection) => {
      const card = cards.find((item) => connection.cardIds.includes(item.id));
      const number = numbers.find((item) => connection.numberValues.includes(item.value));
      if (!card || !number) return;
      const cardSignal = signalForEntity(signals, 'card', card.id, 'tarot.meaning');
      const numberSignal = signalForEntity(
        signals,
        'number',
        `${number.id}:${number.value}`,
        'number.',
      );
      if (!cardSignal || !numberSignal) return;
      const exact = card.number === number.value;
      const hasProvenance =
        [...cardSignal.evidenceReferences, ...numberSignal.evidenceReferences].length > 0;
      results.push(
        createCrossSystemLink({
          direction: 'reinforces',
          displayEligible: exact && hasProvenance,
          exclusionReason: !hasProvenance
            ? 'missing-provenance'
            : exact
              ? null
              : 'artificial-connection',
          priority: exact ? 68 : 34,
          semanticType: 'structural-echo',
          signals: [cardSignal, numberSignal],
          sources,
          strength: exact ? 'secondary' : 'weak',
          themeId: `number-${number.value}`,
          uncertainty: 'symbolic-interpretation',
        }) as CrossSystemResonance,
      );
    });

  return [...new Map(results.map((item) => [item.id, item])).values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}
