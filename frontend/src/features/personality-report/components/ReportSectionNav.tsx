import { useEffect, useMemo, useState } from 'react';

import type { ProfileLocale } from '@entities/personality-profile';
import { Container } from '@shared/ui';

import styles from './ReportSectionNav.module.css';

const items = {
  en: [
    ['summary', 'Main'],
    ['patterns', 'How you think'],
    ['communication', 'How you connect'],
    ['energy', 'What restores you'],
    ['contrasts', 'Where you shift'],
    ['recommendations', 'What to try'],
    ['interpretations', 'Extra lenses'],
  ],
  ru: [
    ['summary', 'Главное'],
    ['patterns', 'Как вы думаете'],
    ['communication', 'Как вы общаетесь'],
    ['energy', 'Что вас заряжает'],
    ['contrasts', 'Где вы меняетесь'],
    ['recommendations', 'Что попробовать'],
    ['interpretations', 'Дополнительные линзы'],
  ],
  uk: [
    ['summary', 'Головне'],
    ['patterns', 'Як ви думаєте'],
    ['communication', 'Як ви спілкуєтеся'],
    ['energy', 'Що вас заряджає'],
    ['contrasts', 'Де ви змінюєтеся'],
    ['recommendations', 'Що спробувати'],
    ['interpretations', 'Додаткові лінзи'],
  ],
} as const;
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
      items[locale].filter(
        ([id]) =>
          (id !== 'contrasts' || hasContrasts) && (id !== 'interpretations' || hasInterpretations),
      ),
    [hasContrasts, hasInterpretations, locale],
  );
  const [active, setActive] = useState('summary');
  const moveToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    setActive(id);
  };
  useEffect(() => {
    const nodes = visible
      .map(([id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(current.target.id);
      },
      { rootMargin: '-28% 0px -60%', threshold: [0, 0.2, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visible]);
  return (
    <nav
      aria-label={
        locale === 'en'
          ? 'Portrait sections'
          : locale === 'uk'
            ? 'Розділи портрета'
            : 'Разделы портрета'
      }
      className={styles.root}
    >
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
