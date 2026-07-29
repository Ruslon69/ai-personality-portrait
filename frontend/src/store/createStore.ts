import type { Store } from './store.types';

export function createStore<TState extends object>(initialState: TState): Store<TState> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    reset: () => {
      state = initialState;
      listeners.forEach((listener) => listener());
    },
    setState: (update) => {
      const partialState = typeof update === 'function' ? update(state) : update;
      state = { ...state, ...partialState };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
