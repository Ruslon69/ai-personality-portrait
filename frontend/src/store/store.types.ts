export type StateUpdate<TState> = Partial<TState> | ((currentState: TState) => Partial<TState>);

export type Store<TState> = {
  getState: () => TState;
  reset: () => void;
  setState: (update: StateUpdate<TState>) => void;
  subscribe: (listener: () => void) => () => void;
};
