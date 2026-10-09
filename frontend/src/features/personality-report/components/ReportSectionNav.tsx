import { reportCopy } from '../data/report-copy';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ProfileLocale } from '@entities/personality-profile';
import { Container } from '@shared/ui';

import { portraitJourneyCopy, portraitSectionIds } from '../data/portrait-journey-copy';
import { navigateToPortraitSection } from './navigate-to-portrait-section';
import styles from './ReportSectionNav.module.css';

export function ReportSectionNav({
  hasContrasts,
  hasInterpretations,
  locale,
}: {
  hasContrasts: boolean;
  hasInterpretations: boolean;
  locale: ProfileLocale;
}) {
  const visible = useMemo(
    () =>
      portraitSectionIds
        .filter(
          (id) =>
            (id !== 'contrasts' || hasContrasts) &&
            (id !== 'interpretations' || hasInterpretations),
        )
        .map((id) => [id, portraitJourneyCopy[locale].sections[id]] as const),
    [hasContrasts, hasInterpretations, locale],
  );
  const [active, setActive] = useState('summary');
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const report = navRef.current?.parentElement;
    const header = document.querySelector('header');
    if (!report || !header) return;
    const measureHeader = () => {
      report.style.setProperty(
        '--portrait-header-offset',
        `${header.getBoundingClientRect().height}px`,
      );
      report.style.setProperty(
        '--portrait-nav-offset',
        `${navRef.current?.getBoundingClientRect().height ?? 0}px`,
      );
    };
    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    observer.observe(header);
    if (navRef.current) observer.observe(navRef.current);
    return () => {
      observer.disconnect();
      report.style.removeProperty('--portrait-header-offset');
      report.style.removeProperty('--portrait-nav-offset');
    };
  }, []);
  const moveToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    if (navigateToPortraitSection(id, true)) setActive(id);
  };
  useEffect(() => {
    const list = navRef.current?.querySelector<HTMLElement>(`.${styles.list}`);
    const current = list?.querySelector<HTMLAnchorElement>('a[aria-current="location"]');
    if (!list || !current) return;
    const listRect = list.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    list.scrollBy({
      left: (currentRect.left + currentRect.right) / 2 - (listRect.left + listRect.right) / 2,
      behavior: 'instant',
    });
  }, [active]);
  useEffect(() => {
    const nodes = visible
      .map(([id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const header = document.querySelector('header');
    let frame = 0;
    const updateActive = () => {
      frame = 0;
      const readingEdge =
        (header?.getBoundingClientRect().height ?? 0) +
        (navRef.current?.offsetHeight ?? 0) +
        5 * parseFloat(getComputedStyle(document.documentElement).fontSize) +
        8;
      const current = nodes
        .map((node) => ({ node, top: node.getBoundingClientRect().top }))
        .filter(({ top }) => top <= readingEdge)
        .sort((a, b) => b.top - a.top)[0];
      setActive(current?.node.id ?? 'summary');
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActive);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    if (header) observer.observe(header);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [visible]);
  return (
    <nav aria-label={reportCopy[locale].sectionNavLabel} className={styles.root} ref={navRef}>
      <Container size="wide">
        <div className={styles.frame}>
          <div className={styles.list}>
            {visible.map(([id, label]) => (
              <a
                aria-current={active === id ? 'location' : undefined}
                href={`#${id}`}
                key={id}
                onClick={(event) => moveToSection(event, id)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </nav>
  );
}
