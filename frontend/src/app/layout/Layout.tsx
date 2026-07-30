import { useCallback, useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Footer, Header, Sidebar } from '@widgets';

import { Main } from './Main';
import type { LayoutProps } from './Layout.types';
import styles from './Layout.module.css';

export function Layout({ children }: LayoutProps) {
  const { currentPath } = useRouter();
  const { messages } = useI18n();
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isMarketing = currentPath === ROUTES.home || currentPath === ROUTES.portrait;

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#app-content">
        {messages.shell.skipToContent}
      </a>
      <Header
        isMenuOpen={!isMarketing && isSidebarOpen}
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setSidebarOpen((isOpen) => !isOpen)}
        variant={isMarketing ? 'marketing' : 'application'}
      />
      <div className={styles.body} data-marketing={isMarketing || undefined}>
        {!isMarketing ? (
          <Sidebar
            isDrawer={!isDesktop}
            isOpen={isDesktop || isSidebarOpen}
            onClose={closeSidebar}
          />
        ) : null}
        <Main>{children}</Main>
      </div>
      <Footer />
    </div>
  );
}
