export type PositionRevealState = 'locked' | 'ready' | 'revealing' | 'revealed';

export type CardRevealState = 'idle' | 'preparing' | 'flipping' | 'settling' | 'settled';

export type RevealSequenceState =
  'waiting' | 'revealing-current' | 'waiting-for-next' | 'all-complete';

export type RevealState = {
  card: CardRevealState;
  currentIndex: number;
  instant: boolean;
  positions: readonly PositionRevealState[];
  sequence: RevealSequenceState;
  total: number;
};

export type RevealAction =
  | { from: CardRevealState; index: number; type: 'phase-complete' }
  | { reducedMotion: boolean; type: 'start' }
  | { type: 'skip' }
  | { reducedMotion: boolean; type: 'next-card' }
  | { type: 'reduced-motion' };

export type RevealTimerPlan = {
  action: RevealAction;
  delay: number;
};

export type RevealClock<TimerHandle> = {
  clear: (handle: TimerHandle) => void;
  set: (callback: () => void, delay: number) => TimerHandle;
};

const durations = {
  flip: 620,
  prepare: 100,
  settle: 140,
} as const;

function replacePosition(
  positions: readonly PositionRevealState[],
  index: number,
  value: PositionRevealState,
) {
  return positions.map((position, positionIndex) => (positionIndex === index ? value : position));
}

function completedState(state: RevealState): RevealState {
  const positions = replacePosition(state.positions, state.currentIndex, 'revealed');
  const nextIndex = state.currentIndex + 1;
  const hasNext = nextIndex < state.total;

  return {
    ...state,
    card: 'settled',
    positions: hasNext ? replacePosition(positions, nextIndex, 'ready') : positions,
    sequence: hasNext ? 'waiting-for-next' : 'all-complete',
  };
}

export function createRevealState(total: number): RevealState {
  const safeTotal = Math.max(0, total);
  return {
    card: 'idle',
    currentIndex: 0,
    instant: false,
    positions: Array.from({ length: safeTotal }, (_, index) => (index === 0 ? 'ready' : 'locked')),
    sequence: safeTotal === 0 ? 'all-complete' : 'waiting',
    total: safeTotal,
  };
}

export function isRevealActive(state: RevealState) {
  return state.sequence === 'revealing-current';
}

export function isCurrentCardVisible(state: RevealState) {
  return (
    state.positions[state.currentIndex] === 'revealed' ||
    state.card === 'flipping' ||
    state.card === 'settling' ||
    state.card === 'settled'
  );
}

export function isPositionFaceUp(state: RevealState, index: number) {
  const position = state.positions[index];
  return (
    position === 'revealed' ||
    (position === 'revealing' &&
      index === state.currentIndex &&
      (state.card === 'flipping' || state.card === 'settling'))
  );
}

export function areAllPositionsRevealed(state: RevealState) {
  return (
    state.positions.length === state.total && state.positions.every((item) => item === 'revealed')
  );
}

export function getRevealCta(state: RevealState): 'open' | 'next' | 'finish' | null {
  if (state.sequence === 'waiting') return 'open';
  if (state.sequence === 'waiting-for-next') return 'next';
  if (state.sequence === 'all-complete') return 'finish';
  return null;
}

export function revealReducer(state: RevealState, action: RevealAction): RevealState {
  switch (action.type) {
    case 'start':
      if (
        state.sequence !== 'waiting' ||
        state.positions[state.currentIndex] !== 'ready' ||
        state.total === 0
      ) {
        return state;
      }
      return action.reducedMotion
        ? completedState({ ...state, instant: true })
        : {
            ...state,
            card: 'preparing',
            instant: false,
            positions: replacePosition(state.positions, state.currentIndex, 'revealing'),
            sequence: 'revealing-current',
          };
    case 'phase-complete':
      if (
        action.index !== state.currentIndex ||
        action.from !== state.card ||
        state.sequence !== 'revealing-current' ||
        state.positions[state.currentIndex] !== 'revealing'
      ) {
        return state;
      }
      if (state.card === 'preparing') return { ...state, card: 'flipping' };
      if (state.card === 'flipping') return { ...state, card: 'settling' };
      if (state.card === 'settling') return completedState(state);
      return state;
    case 'skip':
    case 'reduced-motion':
      return isRevealActive(state) ? completedState({ ...state, instant: true }) : state;
    case 'next-card': {
      if (state.sequence !== 'waiting-for-next') return state;
      const nextIndex = state.currentIndex + 1;
      if (state.positions[nextIndex] !== 'ready') return state;
      const nextState = {
        ...state,
        card: 'idle' as const,
        currentIndex: nextIndex,
        instant: action.reducedMotion,
      };
      return action.reducedMotion
        ? completedState(nextState)
        : {
            ...nextState,
            card: 'preparing',
            positions: replacePosition(state.positions, nextIndex, 'revealing'),
            sequence: 'revealing-current',
          };
    }
  }
}

export function getRevealTimerPlan(state: RevealState): RevealTimerPlan | null {
  if (state.sequence !== 'revealing-current') return null;
  if (state.card === 'preparing') {
    return {
      action: { from: 'preparing', index: state.currentIndex, type: 'phase-complete' },
      delay: durations.prepare,
    };
  }
  if (state.card === 'flipping') {
    return {
      action: { from: 'flipping', index: state.currentIndex, type: 'phase-complete' },
      delay: durations.flip,
    };
  }
  if (state.card === 'settling') {
    return {
      action: { from: 'settling', index: state.currentIndex, type: 'phase-complete' },
      delay: durations.settle,
    };
  }
  return null;
}

export function scheduleRevealTransition<TimerHandle>(
  plan: RevealTimerPlan,
  dispatch: (action: RevealAction) => void,
  clock: RevealClock<TimerHandle>,
) {
  let pending = true;
  const handle = clock.set(() => {
    if (!pending) return;
    pending = false;
    dispatch(plan.action);
  }, plan.delay);
  return () => {
    if (!pending) return;
    pending = false;
    clock.clear(handle);
  };
}
