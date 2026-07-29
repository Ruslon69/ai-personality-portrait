import { createStore } from '../createStore';

export type UiState = {
  isBusy: boolean;
};

const initialUiState: UiState = {
  isBusy: false,
};

export const uiStore = createStore(initialUiState);

export const uiActions = {
  reset: uiStore.reset,
  setBusy(isBusy: boolean) {
    uiStore.setState({ isBusy });
  },
};
