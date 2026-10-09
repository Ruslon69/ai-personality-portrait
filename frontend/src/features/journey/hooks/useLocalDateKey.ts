import { useSyncExternalStore } from 'react';

import { getLocalDateKey } from '../lib/journey-date';
import { nextLocalDayDelay } from '../lib/daily-card-contract';

function subscribe(onChange: () => void) {
  let timer: number;
  function update() {
    window.clearTimeout(timer);
    onChange();
    timer = window.setTimeout(update, nextLocalDayDelay(new Date()));
  }
  function foreground() {
    if (!document.hidden) update();
  }
  timer = window.setTimeout(update, nextLocalDayDelay(new Date()));
  document.addEventListener('visibilitychange', foreground);
  window.addEventListener('focus', update);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', foreground);
    window.removeEventListener('focus', update);
  };
}

export function useLocalDateKey() {
  return useSyncExternalStore(subscribe, getLocalDateKey, getLocalDateKey);
}
