import { routeCopy } from './route-copy';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import type { ComponentType } from 'react';

import { useI18n } from '@shared/i18n';
import { Spinner } from '@shared/ui';

import { resolveRoute } from './routes';
import { resolveRouteDocumentMetadata } from './route-metadata';
import { restoreCurrentRouteScroll } from './scroll-restoration';
import styles from './RouterOutlet.module.css';
import { useRouter } from './useRouter';

function RoutePage({ Page, path }: { Page: ComponentType; path: string }) {
  useLayoutEffect(() => restoreCurrentRouteScroll(), [path]);
  return <Page />;
}

export function RouterOutlet() {
  const { currentPath } = useRouter();
  const { locale } = useI18n();
  const previousPathRef = useRef(currentPath);
  const route = resolveRoute(currentPath);
  const Page = route.component;

  useLayoutEffect(() => {
    const metadata = resolveRouteDocumentMetadata(currentPath, locale);
    document.title = metadata.title;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ])
      document
        .querySelector<HTMLMetaElement>(selector)
        ?.setAttribute('content', metadata.description);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]'])
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', metadata.title);
    document
      .querySelector<HTMLMetaElement>('meta[name="robots"]')
      ?.setAttribute('content', metadata.robots);
  }, [currentPath, locale]);

  useEffect(() => {
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    const animationFrame = window.requestAnimationFrame(() => {
      const main = document.getElementById('app-content');

      if (main && !main.contains(document.activeElement)) {
        // Route scroll restoration owns position; landmark focus must not move it.
        main.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentPath]);

  return (
    <div className={styles.route} key={currentPath}>
      <Suspense
        fallback={
          <div aria-label={routeCopy[locale].loading} className={styles.loading} role="status">
            <Spinner />
          </div>
        }
      >
        <RoutePage Page={Page} path={currentPath} />
      </Suspense>
    </div>
  );
}
