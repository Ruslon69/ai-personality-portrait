import { Suspense, useEffect, useRef } from 'react';

import { useI18n } from '@shared/i18n';
import { Spinner } from '@shared/ui';

import { resolveRoute } from './routes';
import styles from './RouterOutlet.module.css';
import { useRouter } from './useRouter';

export function RouterOutlet() {
  const { currentPath } = useRouter();
  const { locale } = useI18n();
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

  return (
    <div className={styles.route} key={currentPath}>
      <Suspense
        fallback={
          <div
            aria-label={
              locale === 'en'
                ? 'Loading page'
                : locale === 'uk'
                  ? 'Завантаження сторінки'
                  : 'Загрузка страницы'
            }
            className={styles.loading}
            role="status"
          >
            <Spinner />
          </div>
        }
      >
        <Page />
      </Suspense>
    </div>
  );
}
