import { useEffect, useState, type CSSProperties } from 'react';

import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './ResultReveal.module.css';

const shownProfiles = new Set<string>();
type Props = { opened: boolean; onOpen: () => void; profile: PersonalityProfile };

export function ResultReveal({ opened, onOpen, profile }: Props) {
  const [ready, setReady] = useState(opened || shownProfiles.has(profile.id));
  const copy = {
    en: {
      eyebrow: 'Your portrait is ready',
      symbol: 'Your personal abstract portrait mark',
      show: 'Show now',
      open: 'Open my portrait',
      sources: 'Sources are joining the portrait',
    },
    ru: {
      eyebrow: 'Ваш портрет готов',
      symbol: 'Ваш персональный абстрактный знак портрета',
      show: 'Показать сразу',
      open: 'Открыть мой портрет',
      sources: 'Источники соединяются в портрет',
    },
    uk: {
      eyebrow: 'Ваш портрет готовий',
      symbol: 'Ваш персональний абстрактний знак портрета',
      show: 'Показати одразу',
      open: 'Відкрити мій портрет',
      sources: 'Джерела поєднуються в портрет',
    },
  }[profile.locale];
  useEffect(() => {
    if (ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setReady(true), reduced ? 0 : 2300);
    return () => window.clearTimeout(timer);
  }, [ready]);
  const open = () => {
    shownProfiles.add(profile.id);
    setReady(true);
    onOpen();
  };
  return (
    <section
      aria-labelledby="full-report-title"
      className={styles.root}
      data-opened={opened || undefined}
      data-ready={ready || undefined}
    >
      <Container size="wide">
        <Surface className={styles.surface} elevation="low">
          <div className={styles.grid}>
            <div className={styles.visual}>
              <PortraitMark identity={profile.visualIdentity} label={copy.symbol} size="lg" />
            </div>
            <Stack align="start" className={styles.content} gap="lg">
              <Badge tone="success">{copy.eyebrow}</Badge>
              <div aria-label={copy.sources} className={styles.sourceOrbit} role="list">
                {profile.sourceDetails
                  .filter((source) => source.status !== 'omitted')
                  .slice(0, 5)
                  .map((source, index) => (
                    <span
                      key={source.id}
                      role="listitem"
                      style={{ '--source-delay': `${350 + index * 180}ms` } as CSSProperties}
                    >
                      {source.shortLabel}
                    </span>
                  ))}
              </div>
              <Stack gap="md">
                <Typography
                  as="h1"
                  className={styles.title}
                  id="full-report-title"
                  tabIndex={-1}
                  variant="display"
                >
                  {profile.revealHeadline}
                </Typography>
                <Typography className={styles.lead} variant="lead">
                  {profile.revealLead}
                </Typography>
              </Stack>
              <div className={styles.traits}>
                {profile.keyTraits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
              {ready ? (
                <Button onClick={open} prominence="primary" size="large">
                  {copy.open}
                  <span aria-hidden="true"> →</span>
                </Button>
              ) : (
                <Button onClick={open} prominence="quiet">
                  {copy.show}
                </Button>
              )}
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
