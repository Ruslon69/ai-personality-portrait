import { createStore } from '../createStore';

export type SessionState = {
  sessionId: string | null;
};

const initialSessionState: SessionState = {
  sessionId: null,
};

export const sessionStore = createStore(initialSessionState);

export const sessionActions = {
  clear: sessionStore.reset,
  setSessionId(sessionId: string | null) {
    sessionStore.setState({ sessionId });
  },
};
