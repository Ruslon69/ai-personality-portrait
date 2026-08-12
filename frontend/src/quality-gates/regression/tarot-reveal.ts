import {
  areAllPositionsRevealed,
  createRevealState,
  getRevealCta,
  getRevealTimerPlan,
  isCurrentCardVisible,
  isPositionFaceUp,
  isRevealActive,
  revealReducer,
  scheduleRevealTransition,
  type RevealAction,
  type RevealState,
} from '../../features/tarot/flows/reveal-state-machine';
import { QualityAssertions } from '../assertions';

function applyTimer(state: RevealState) {
  const plan = getRevealTimerPlan(state);
  return plan ? revealReducer(state, plan.action) : state;
}

function finishCurrent(state: RevealState) {
  let current = state;
  while (current.sequence === 'revealing-current') current = applyTimer(current);
  return current;
}

function countState(state: RevealState, value: RevealState['positions'][number]) {
  return state.positions.filter((position) => position === value).length;
}

export function runTarotRevealGate() {
  const assertions = new QualityAssertions();

  const initial = createRevealState(5);
  assertions.assert(
    initial.positions.join(',') === 'ready,locked,locked,locked,locked' &&
      countState(initial, 'ready') === 1,
    {
      actual: initial.positions.join(','),
      code: 'tarot-reveal-one-ready-position',
      expected: 'ready,locked,locked,locked,locked',
      message: 'Exactly the first spread position must be ready initially.',
    },
  );
  assertions.assert(getRevealCta(initial) === 'open', {
    code: 'tarot-reveal-initial-cta',
    message: 'The initial state must expose the canonical open-card action.',
  });

  let single = revealReducer(createRevealState(1), { reducedMotion: false, type: 'start' });
  assertions.assert(
    single.card === 'preparing' && isRevealActive(single) && single.positions[0] === 'revealing',
    {
      code: 'tarot-reveal-preparing',
      message: 'Reveal must enter an explicit preparing state for its active position.',
    },
  );
  const delays: number[] = [];
  while (single.sequence !== 'all-complete') {
    const plan = getRevealTimerPlan(single);
    if (!plan) break;
    delays.push(plan.delay);
    single = revealReducer(single, plan.action);
  }
  const duration = delays.reduce((sum, delay) => sum + delay, 0);
  assertions.assert(
    single.card === 'settled' &&
      single.sequence === 'all-complete' &&
      single.positions[0] === 'revealed' &&
      isCurrentCardVisible(single),
    {
      code: 'tarot-reveal-natural-completion',
      message: 'A reveal must become a stable face-up card without Skip.',
    },
  );
  assertions.assert(duration === 860, {
    actual: duration,
    code: 'tarot-reveal-bounded-duration',
    expected: 860,
    message: 'A card reveal must remain inside its deterministic motion budget.',
  });
  assertions.assert(getRevealCta(single) === 'finish', {
    code: 'tarot-reveal-final-cta',
    message: 'The final revealed card must expose the finish-spread action.',
  });

  let skipped = revealReducer(createRevealState(3), { reducedMotion: false, type: 'start' });
  skipped = applyTimer(skipped);
  assertions.assert(skipped.card === 'flipping' && isPositionFaceUp(skipped, 0), {
    code: 'tarot-reveal-face-swap',
    message: 'The active face must become visible during the bounded physical flip.',
  });
  skipped = revealReducer(skipped, { type: 'skip' });
  assertions.assert(
    skipped.card === 'settled' &&
      !isRevealActive(skipped) &&
      skipped.sequence === 'waiting-for-next' &&
      skipped.instant &&
      skipped.positions.join(',') === 'revealed,ready,locked' &&
      getRevealCta(skipped) === 'next',
    {
      actual: skipped.positions.join(','),
      code: 'tarot-reveal-skip-stable',
      expected: 'revealed,ready,locked',
      message: 'Skip must cancel motion and expose one stable card plus one ready card.',
    },
  );
  assertions.assert(getRevealTimerPlan(skipped) === null, {
    code: 'tarot-reveal-no-infinite-timer',
    message: 'No animation timer may survive after a card has settled.',
  });

  const reduced = revealReducer(createRevealState(2), { reducedMotion: true, type: 'start' });
  assertions.assert(
    reduced.card === 'settled' &&
      !isRevealActive(reduced) &&
      reduced.instant &&
      reduced.positions.join(',') === 'revealed,ready' &&
      getRevealTimerPlan(reduced) === null,
    {
      code: 'tarot-reveal-reduced-immediate',
      message: 'Reduced motion must reveal immediately without a useless Skip state.',
    },
  );

  for (const total of [1, 3, 5, 6]) {
    let multi = createRevealState(total);
    const completedIndices: number[] = [];
    multi = revealReducer(multi, { reducedMotion: false, type: 'start' });
    while (multi.sequence !== 'all-complete') {
      multi = finishCurrent(multi);
      completedIndices.push(multi.currentIndex);

      assertions.assert(
        multi.positions.slice(0, multi.currentIndex + 1).every((item) => item === 'revealed'),
        {
          code: `tarot-reveal-${total}-previous-persist`,
          message: `Previously revealed cards in a ${total}-card spread must never re-hide.`,
        },
      );
      if (multi.sequence === 'waiting-for-next') {
        assertions.assert(
          countState(multi, 'ready') === 1 &&
            multi.positions.slice(multi.currentIndex + 2).every((item) => item === 'locked'),
          {
            code: `tarot-reveal-${total}-future-locked`,
            message: `A ${total}-card spread must keep every future card except the next one locked.`,
          },
        );
        const beforeNext = multi;
        multi = revealReducer(multi, { reducedMotion: false, type: 'next-card' });
        assertions.assert(
          multi.currentIndex === beforeNext.currentIndex + 1 &&
            multi.positions[beforeNext.currentIndex] === 'revealed' &&
            multi.positions[multi.currentIndex] === 'revealing',
          {
            code: `tarot-reveal-${total}-card-advance`,
            message: `Next must advance exactly one position in a ${total}-card spread.`,
          },
        );
      }
    }
    completedIndices.push(multi.currentIndex);
    const expectedIndices = Array.from({ length: total }, (_, index) => index).join(',');
    assertions.assert(
      completedIndices.filter((value, index, values) => value !== values[index - 1]).join(',') ===
        expectedIndices && areAllPositionsRevealed(multi),
      {
        actual: completedIndices.join(','),
        code: `tarot-reveal-${total}-card-complete`,
        expected: expectedIndices,
        message: `${total}-card spread must deliver every face-up card to the final reading state.`,
      },
    );
  }

  const timerCallbacks: Array<() => void> = [];
  const cleared: number[] = [];
  const dispatched: RevealAction[] = [];
  const plan = getRevealTimerPlan(
    revealReducer(createRevealState(1), { reducedMotion: false, type: 'start' }),
  );
  if (plan) {
    const cancel = scheduleRevealTransition<number>(plan, (action) => dispatched.push(action), {
      clear: (handle) => cleared.push(handle),
      set: (callback) => {
        timerCallbacks.push(callback);
        return timerCallbacks.length;
      },
    });
    cancel();
    timerCallbacks[0]?.();
  }
  assertions.assert(cleared.length === 1 && dispatched.length === 0, {
    code: 'tarot-reveal-unmount-cleanup',
    message: 'Unmount, Skip, and advance cleanup must cancel the pending reveal timer.',
  });

  const duplicateActions: RevealAction[] = [];
  if (plan) {
    scheduleRevealTransition<number>(plan, (action) => duplicateActions.push(action), {
      clear: () => undefined,
      set: (callback) => {
        callback();
        callback();
        return 1;
      },
    });
  }
  assertions.assert(duplicateActions.length === 1, {
    code: 'tarot-reveal-completion-once',
    message: 'Timer completion must fire once even if the clock callback is duplicated.',
  });

  const preparing = revealReducer(createRevealState(1), { reducedMotion: false, type: 'start' });
  const firstPlan = getRevealTimerPlan(preparing);
  const flipping = firstPlan ? revealReducer(preparing, firstPlan.action) : preparing;
  const duplicate = firstPlan ? revealReducer(flipping, firstPlan.action) : flipping;
  assertions.assert(duplicate === flipping, {
    code: 'tarot-reveal-stale-phase-completion',
    message: 'A stale or duplicate completion must not advance a later reveal phase.',
  });

  return assertions.result({ fixtureCount: 12 });
}
