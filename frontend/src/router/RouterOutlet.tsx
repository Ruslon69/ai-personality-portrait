import { useEffect, useRef } from 'react';

import { resolveRoute } from './routes';
import { useRouter } from './useRouter';

export function RouterOutlet() {
  const { currentPath } = useRouter();
  const previousPathRef = useRef(currentPath);
  const route = resolveRoute(currentPath);
  const Page = route.component;

  useEffect(() => {
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    const animationFrame = window.requestAnimationFrame(() => {
      const main = document.getElementById('app-content');

      if (main && !main.contains(document.activeElement)) {
        main.focus();
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentPath]);

  return <Page />;
}
