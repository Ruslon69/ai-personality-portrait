import { useState } from 'react';

import type {
  Insight,
  PersonalityProfile,
  PersonalityRecommendation,
} from '@entities/personality-profile';
import { Badge, Button, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import { reportCopy } from '../data/report-copy';
import { useDisclosureState } from '../hooks';
import { SourcesSection } from '../sections';
import { ExplainCard } from './ExplainCard';
import { PortraitSummary } from './PortraitSummary';
import { ReportSectionNav } from './ReportSectionNav';
import { ResultReveal } from './ResultReveal';
import { SourceChip } from './SourceChip';
import { TransparencyPanel } from './TransparencyPanel';
import styles from './PersonalizedReport.module.css';

type Props = { onShare: () => void; profile: PersonalityProfile };
type RecommendationReaction = 'want' | 'notMe' | 'already';

function SectionHeading({
  eyebrow,
  id,
  lead,
  title,
}: {
  eyebrow: string;
  id: string;
  lead?: string;
  title: string;
}) {
  return (
    <Stack className={styles.sectionHeading} gap="sm">
      <Typography as="p" variant="eyebrow">
        {eyebrow}
      </Typography>
      <Typography as="h2" id={id} variant="heading-lg">
        {title}
      </Typography>
      {lead ? <Typography className={styles.muted}>{lead}</Typography> : null}
    </Stack>
  );
}

function PortraitMap({ profile }: { profile: PersonalityProfile }) {
  const copy = reportCopy[profile.locale];
  return (
    <section aria-labelledby="portrait-map-title" className={styles.section} id="portrait-map">
      <Container size="wide">
        <SectionHeading
          eyebrow={copy.mapEyebrow}
          id="portrait-map-title"
          lead={copy.mapLead}
          title={copy.mapTitle}
        />
        <div className={styles.map} role="list">
          <div aria-hidden="true" className={styles.mapCore}>
            <span>{copy.core}</span>
          </div>
          <svg aria-hidden="true" className={styles.mapLines} viewBox="0 0 800 440">
            <path d="M400 220 175 88" />
            <path d="M400 220 620 74" />
            <path d="M400 220 690 230" />
            <path d="M400 220 595 370" />
            <path d="M400 220 220 370" />
            <path d="M400 220 112 225" />
          </svg>
          {profile.portraitFacets.map((facet, index) => (
            <a
              className={styles.facet}
              data-position={index + 1}
              href={`#${facet.targetId}`}
              key={facet.id}
              role="listitem"
            >
              <span className={styles.facetLabel}>{facet.label}</span>
              <strong>{facet.title}</strong>
              <span className={styles.facetReveal}>{facet.description}</span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PatternSection({
  profile,
  expanded,
  toggle,
}: {
  profile: PersonalityProfile;
  expanded: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const copy = reportCopy[profile.locale];
  const primary = profile.strengths.slice(0, 3);
  const more = [...profile.strengths.slice(3), ...profile.growthAreas];
  return (
    <section aria-labelledby="patterns-title" className={styles.section} id="patterns">
      <Container size="wide">
        <SectionHeading
          eyebrow={copy.patternsEyebrow}
          id="patterns-title"
          lead={copy.patternsLead}
          title={copy.patternsTitle}
        />
        <div className={styles.patternGrid}>
          {primary.map((insight, index) => (
            <ExplainCard
              expanded={expanded(insight.id)}
              insight={insight}
              key={insight.id}
              locale={profile.locale}
              onToggle={toggle}
              order={index}
              variant={index === 0 ? 'featured' : 'default'}
            />
          ))}
        </div>
        {more.length ? (
          <details className={styles.morePatterns}>
            <summary>{copy.morePatterns}</summary>
            <div className={styles.secondaryPatterns}>
              {more.map((insight, index) => (
                <ExplainCard
                  expanded={expanded(insight.id)}
                  insight={insight}
                  key={insight.id}
                  locale={profile.locale}
                  onToggle={toggle}
                  order={index}
                />
              ))}
            </div>
          </details>
        ) : null}
      </Container>
    </section>
  );
}

function ContrastSection({ profile }: { profile: PersonalityProfile }) {
  const [activeView, setActiveView] = useState<Record<string, 'usual' | 'when'>>({});
  if (!profile.contrasts.length) return null;
  const copy = reportCopy[profile.locale];
  return (
    <section aria-labelledby="contrasts-title" className={styles.section} id="contrasts">
      <Container size="wide">
        <SectionHeading
          eyebrow={copy.contrastEyebrow}
          id="contrasts-title"
          title={copy.contrastTitle}
        />
        <div className={styles.contrastGrid}>
          {profile.contrasts.map((contrast) => (
            <Card
              className={styles.contrastCard}
              data-view={activeView[contrast.id] ?? 'usual'}
              key={contrast.id}
            >
              <div aria-label={copy.contrastTitle} className={styles.contrastToggle} role="group">
                <Button
                  aria-pressed={(activeView[contrast.id] ?? 'usual') === 'usual'}
                  onClick={() =>
                    setActiveView((current) => ({ ...current, [contrast.id]: 'usual' }))
                  }
                  prominence="quiet"
                >
                  {copy.usual}
                </Button>
                <Button
                  aria-pressed={activeView[contrast.id] === 'when'}
                  onClick={() =>
                    setActiveView((current) => ({ ...current, [contrast.id]: 'when' }))
                  }
                  prominence="quiet"
                >
                  {copy.when}
                </Button>
              </div>
              <div className={styles.contrastPair}>
                <div data-panel="usual">
                  <span>{copy.usual}</span>
                  <p>{contrast.usual}</p>
                </div>
                <div data-panel="when">
                  <span>{copy.when}</span>
                  <p>{contrast.context}</p>
                </div>
              </div>
              <div className={styles.contrastMeaning}>
                <strong>{copy.means}</strong>
                <p>{contrast.meaning}</p>
                <strong>{copy.try}</strong>
                <p>{contrast.suggestion}</p>
              </div>
              <div className={styles.sourceRow}>
                {contrast.sources.map((source) => (
                  <SourceChip key={source.id} locale={profile.locale} source={source} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Narrative({
  eyebrow,
  expanded,
  id,
  insights,
  locale,
  title,
  toggle,
}: {
  eyebrow: string;
  expanded: (id: string) => boolean;
  id: string;
  insights: readonly Insight[];
  locale: PersonalityProfile['locale'];
  title: string;
  toggle: (id: string) => void;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={styles.section} id={id}>
      <Container size="wide">
        <SectionHeading eyebrow={eyebrow} id={`${id}-title`} title={title} />
        <div className={styles.narrativeGrid}>
          {insights.map((insight, index) => (
            <ExplainCard
              expanded={expanded(insight.id)}
              insight={insight}
              key={insight.id}
              locale={locale}
              onToggle={toggle}
              order={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Recommendations({ profile }: { profile: PersonalityProfile }) {
  const copy = reportCopy[profile.locale];
  const [reactions, setReactions] = useState<Record<string, RecommendationReaction>>({});
  return (
    <section
      aria-labelledby="recommendations-title"
      className={styles.section}
      id="recommendations"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow={copy.recommendationsEyebrow}
          id="recommendations-title"
          lead={copy.recommendationsLead}
          title={copy.recommendationsTitle}
        />
        <div className={styles.recommendations}>
          {profile.recommendations.map((item: PersonalityRecommendation, index) => (
            <Card
              className={styles.recommendation}
              data-reaction={reactions[item.id]}
              key={item.id}
            >
              <div className={styles.recommendationHeader}>
                <span aria-hidden="true" className={styles.recommendationIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Badge tone="info">{copy.categories[item.category]}</Badge>
              </div>
              <Stack gap="md">
                <Typography as="h3" variant="heading-sm">
                  {item.title}
                </Typography>
                <div>
                  <strong>{copy.action}</strong>
                  <Typography>{item.description}</Typography>
                </div>
                <div>
                  <strong>{copy.context}</strong>
                  <Typography className={styles.muted}>{item.context}</Typography>
                </div>
                <div>
                  <strong>{copy.why}</strong>
                  <Typography className={styles.muted}>{item.explanation}</Typography>
                </div>
                {reactions[item.id] === 'want' ? (
                  <div className={styles.miniPlan}>
                    <strong>{copy.planReady}</strong>
                    <span>
                      {copy.firstStep}: {item.actionLabel}
                    </span>
                    <Button
                      onClick={() =>
                        setReactions((current) => {
                          const next = { ...current };
                          delete next[item.id];
                          return next;
                        })
                      }
                      prominence="quiet"
                    >
                      {copy.undo}
                    </Button>
                  </div>
                ) : null}
                <div aria-label={item.title} className={styles.reactionGroup} role="group">
                  {(['want', 'notMe', 'already'] as const).map((reaction) => (
                    <Button
                      aria-pressed={reactions[item.id] === reaction}
                      key={reaction}
                      onClick={() =>
                        setReactions((current) => ({ ...current, [item.id]: reaction }))
                      }
                      prominence={reactions[item.id] === reaction ? 'secondary' : 'quiet'}
                    >
                      {copy[reaction]}
                    </Button>
                  ))}
                </div>
                <span aria-live="polite" className={styles.reactionStatus}>
                  {reactions[item.id] ? copy.saved : ''}
                </span>
              </Stack>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Interpretations({ profile }: { profile: PersonalityProfile }) {
  const copy = reportCopy[profile.locale];
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const [detailed, setDetailed] = useState<readonly string[]>([]);
  const [status, setStatus] = useState('');
  if (!profile.interpretations.length) return null;
  const visible = profile.interpretations.filter((item) => !hidden.includes(item.id));
  return (
    <section
      aria-labelledby="interpretations-title"
      className={styles.section}
      id="interpretations"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow={copy.interpretationEyebrow}
          id="interpretations-title"
          lead={copy.interpretationLead}
          title={copy.interpretationTitle}
        />
        <div className={styles.interpretations}>
          {visible.map((item) => (
            <Card
              className={styles.interpretationCard}
              data-kind={item.sources[0]?.id}
              key={item.id}
            >
              <div aria-hidden="true" className={styles.interpretationVisual}>
                {item.sources[0]?.id === 'numerology'
                  ? (item.title.match(/\d+/)?.[0] ?? '#')
                  : item.sources[0]?.id === 'zodiac'
                    ? '◯'
                    : '· · ○ ·'}
              </div>
              <Stack gap="md">
                <div className={styles.sourceRow}>
                  {item.sources.map((source) => (
                    <SourceChip key={source.id} locale={profile.locale} source={source} />
                  ))}
                </div>
                <Typography as="h3" variant="heading-sm">
                  {item.title}
                </Typography>
                <Typography>{item.description}</Typography>
                <div aria-label={item.title} className={styles.interpretationControls} role="group">
                  <Button
                    aria-pressed={!detailed.includes(item.id)}
                    onClick={() => setDetailed((current) => current.filter((id) => id !== item.id))}
                    prominence="quiet"
                  >
                    {copy.short}
                  </Button>
                  <Button
                    aria-pressed={detailed.includes(item.id)}
                    onClick={() =>
                      setDetailed((current) =>
                        current.includes(item.id) ? current : [...current, item.id],
                      )
                    }
                    prominence="quiet"
                  >
                    {copy.details}
                  </Button>
                </div>
                {detailed.includes(item.id) ? (
                  <Typography className={styles.muted}>{item.explanation}</Typography>
                ) : null}
                <Button
                  onClick={() => {
                    setHidden((current) => [...new Set([...current, item.id])]);
                    setStatus(`${item.title}. ${copy.hiddenStatus}`);
                  }}
                  prominence="quiet"
                >
                  {copy.hideLayer}
                </Button>
              </Stack>
            </Card>
          ))}
        </div>
        <span aria-atomic="true" aria-live="polite" className={styles.visuallyHidden}>
          {status}
        </span>
        {hidden.length ? (
          <Surface className={styles.hiddenLayers} elevation="low">
            <Stack gap="md">
              <div className={styles.hiddenLayersHeader}>
                <Typography as="h3" variant="heading-sm">
                  {copy.hiddenLayers}
                </Typography>
                <Button
                  onClick={() => {
                    setHidden([]);
                    setStatus(copy.restoredStatus);
                  }}
                  prominence="quiet"
                >
                  {copy.restoreAllLayers}
                </Button>
              </div>
              <ul className={styles.hiddenLayerList}>
                {profile.interpretations
                  .filter((item) => hidden.includes(item.id))
                  .map((item) => (
                    <li key={item.id}>
                      <span>{item.title}</span>
                      <Button
                        onClick={() => {
                          setHidden((current) => current.filter((id) => id !== item.id));
                          setStatus(`${item.title}. ${copy.restoredStatus}`);
                        }}
                        prominence="secondary"
                      >
                        {copy.restoreLayer}
                      </Button>
                    </li>
                  ))}
              </ul>
            </Stack>
          </Surface>
        ) : null}
        <Surface className={styles.futurePreview}>
          <Stack gap="xs">
            <Typography as="h3" variant="heading-sm">
              {copy.future}
            </Typography>
            <Typography className={styles.muted}>{copy.futureNote}</Typography>
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}

export function PersonalizedReport({ onShare, profile }: Props) {
  const copy = reportCopy[profile.locale];
  const { isExpanded, toggle } = useDisclosureState();
  const [opened, setOpened] = useState(false);
  return (
    <div className={styles.root}>
      <ResultReveal onOpen={() => setOpened(true)} opened={opened} profile={profile} />
      {opened ? (
        <>
          <ReportSectionNav
            hasContrasts={profile.contrasts.length > 0}
            hasInterpretations={profile.interpretations.length > 0}
            locale={profile.locale}
          />
          <PortraitSummary profile={profile} />
          <PortraitMap profile={profile} />
          <PatternSection expanded={isExpanded} profile={profile} toggle={toggle} />
          <ContrastSection profile={profile} />
          <Narrative
            eyebrow={copy.communicationEyebrow}
            expanded={isExpanded}
            id="communication"
            insights={profile.communication.items}
            locale={profile.locale}
            title={copy.communicationTitle}
            toggle={toggle}
          />
          <Narrative
            eyebrow={copy.energyEyebrow}
            expanded={isExpanded}
            id="energy"
            insights={profile.energy.items}
            locale={profile.locale}
            title={copy.energyTitle}
            toggle={toggle}
          />
          <Recommendations profile={profile} />
          <Interpretations profile={profile} />
          <TransparencyPanel locale={profile.locale} />
          <SourcesSection
            isExpanded={isExpanded}
            items={profile.sourceDetails}
            locale={profile.locale}
            onToggle={toggle}
          />
          <section aria-labelledby="report-final-title" className={styles.final}>
            <Container size="wide">
              <Surface className={styles.finalSurface} elevation="low">
                <Stack align="center" gap="lg">
                  <Stack align="center" className={styles.finalCopy} gap="sm">
                    <Typography as="p" variant="eyebrow">
                      {copy.finalEyebrow}
                    </Typography>
                    <Typography as="h2" id="report-final-title" variant="heading-lg">
                      {copy.finalTitle}
                    </Typography>
                    <Typography className={styles.muted}>{copy.finalLead}</Typography>
                  </Stack>
                  <Button onClick={onShare} prominence="primary" size="large">
                    {copy.share}
                  </Button>
                </Stack>
              </Surface>
            </Container>
          </section>
        </>
      ) : null}
    </div>
  );
}
