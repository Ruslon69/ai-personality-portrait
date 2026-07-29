import { useCallback, useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import { Footer, Header, Sidebar } from '@widgets';

import { Main } from './Main';
import type { LayoutProps } from './Layout.types';
import styles from './Layout.module.css';

export function Layout({ children }: LayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#app-content">
        Перейти к основному содержимому
      </a>
      <Header
        isMenuOpen={isSidebarOpen}
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setSidebarOpen((isOpen) => !isOpen)}
      />
      <div className={styles.body}>
        <Sidebar isDrawer={!isDesktop} isOpen={isDesktop || isSidebarOpen} onClose={closeSidebar} />
        <Main>{children}</Main>
      </div>
      <Footer />
    </div>
  );
}
