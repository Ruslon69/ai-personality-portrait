import { createStore } from '../createStore';

export type AppState = {
  isReady: boolean;
};

const initialAppState: AppState = {
  isReady: false,
};

export const appStore = createStore(initialAppState);

export const appActions = {
  reset: appStore.reset,
  setReady(isReady: boolean) {
    appStore.setState({ isReady });
  },
};
