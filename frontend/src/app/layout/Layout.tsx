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
  const isPortraitFlow =
    currentPath === ROUTES.portrait ||
    currentPath === ROUTES.portraitQuestions ||
    currentPath === ROUTES.portraitVoice ||
    currentPath === ROUTES.portraitBirthDate ||
    currentPath === ROUTES.portraitGenerating ||
    currentPath === ROUTES.portraitResultPreview ||
    currentPath === ROUTES.portraitResult;
  const isPersonalSpace =
    currentPath === ROUTES.profile ||
    currentPath === ROUTES.profileHistory ||
    currentPath === ROUTES.tarotHistory ||
    currentPath === ROUTES.numerologyResult;
  const isUtility =
    currentPath === ROUTES.settings ||
    currentPath === ROUTES.privacy ||
    currentPath === ROUTES.terms ||
    currentPath === ROUTES.notFound ||
    currentPath === ROUTES.compatibility ||
    !Object.values<string>(ROUTES).includes(currentPath);
  const atmosphere = isPortraitFlow
    ? 'portrait'
    : currentPath === ROUTES.numerology ||
        currentPath === ROUTES.numerologyProfile ||
        currentPath === ROUTES.numerologyResult
      ? 'numerology'
      : isPersonalSpace
        ? 'archive'
        : isUtility
          ? 'quiet'
          : undefined;
  const isMarketing =
    currentPath === ROUTES.home ||
    isPortraitFlow ||
    isUtility ||
    currentPath === ROUTES.tarot ||
    currentPath === ROUTES.tarotReading ||
    currentPath === ROUTES.numerology ||
    currentPath === ROUTES.numerologyProfile;
  const hasCompactSidebar =
    currentPath === ROUTES.tarotResult ||
    currentPath === ROUTES.tarotHistory ||
    currentPath === ROUTES.profileHistory;

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  return (
    <div
      className={styles.root}
      data-atmosphere={atmosphere}
      data-personal-space={isPersonalSpace || undefined}
      data-portrait-flow={isPortraitFlow || undefined}
      data-utility={isUtility || undefined}
    >
      <a className={styles.skipLink} href="#app-content">
        {messages.shell.skipToContent}
      </a>
      <Header
        isMenuOpen={isSidebarOpen}
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setSidebarOpen((isOpen) => !isOpen)}
        showSettings={isUtility || !isMarketing || currentPath === ROUTES.tarotReading}
        showMenu
        variant={isMarketing && currentPath !== ROUTES.settings ? 'marketing' : 'application'}
      />
      <div
        className={styles.body}
        data-compact-sidebar={hasCompactSidebar || undefined}
        data-marketing={isMarketing || undefined}
        data-tarot-result={currentPath === ROUTES.tarotResult || undefined}
        data-personal-space={isPersonalSpace || undefined}
      >
        {!isMarketing && !isPersonalSpace && isDesktop ? (
          <Sidebar isDrawer={false} isOpen onClose={closeSidebar} />
        ) : null}
        <Main>{children}</Main>
      </div>
      <Sidebar isDrawer isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Footer />
    </div>
  );
}
