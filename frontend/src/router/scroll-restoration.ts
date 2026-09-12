type NavigationKind = 'forward' | 'history' | 'initial' | 'replace';

const routeKey = '__soulArkanaRouteKey';
const positions = new Map<string, { left: number; top: number }>();

let navigationKind: NavigationKind = 'initial';
let initialized = false;

function createKey() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getState() {
  return (window.history.state ?? {}) as Record<string, unknown>;
}

function getCurrentKey() {
  const key = getState()[routeKey];
  return typeof key === 'string' ? key : null;
}

function ensureCurrentKey() {
  const existingKey = getCurrentKey();
  if (existingKey) return existingKey;

  const key = createKey();
  window.history.replaceState({ ...getState(), [routeKey]: key }, '', window.location.href);
  return key;
}

export function saveCurrentScrollPosition() {
  positions.set(ensureCurrentKey(), { left: window.scrollX, top: window.scrollY });
}

export function initializeScrollRestoration(onHistoryNavigation: () => void) {
  if (initialized) return () => undefined;
  initialized = true;

  ensureCurrentKey();
  window.history.scrollRestoration = 'manual';

  const recordPosition = () => saveCurrentScrollPosition();
  const handlePopState = () => {
    navigationKind = 'history';
    onHistoryNavigation();
  };

  window.addEventListener('scroll', recordPosition, { passive: true });
  window.addEventListener('popstate', handlePopState);

  return () => {
    initialized = false;
    window.removeEventListener('scroll', recordPosition);
    window.removeEventListener('popstate', handlePopState);
    window.history.scrollRestoration = 'auto';
  };
}

export function createNavigationState(kind: Extract<NavigationKind, 'forward' | 'replace'>) {
  saveCurrentScrollPosition();
  navigationKind = kind;
  return { ...getState(), [routeKey]: createKey() };
}

export function restoreCurrentRouteScroll() {
  if (navigationKind === 'history') {
    const savedPosition = positions.get(ensureCurrentKey());
    window.scrollTo(savedPosition?.left ?? 0, savedPosition?.top ?? 0);
  } else if (navigationKind !== 'initial') {
    window.scrollTo(0, 0);
  }

  navigationKind = 'initial';
}
