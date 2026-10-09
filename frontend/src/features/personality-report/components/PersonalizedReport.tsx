import { PortraitMark, type ProfileLocale } from '@entities/personality-profile';
import { navigateToPortraitSection } from './navigate-to-portrait-section';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { useRef, useState, type ReactNode } from 'react';
import { findPortraitZodiacArtwork } from '@assets/zodiac';
import { ZodiacChapter } from '@shared/ui/zodiac-artwork/ZodiacChapter';

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
import { PortraitChapter } from './PortraitChapter';
import { PortraitSectionTransition } from './PortraitSectionTransition';
import { PortraitSummary } from './PortraitSummary';
import { ReportSectionNav } from './ReportSectionNav';
import { ResultReveal } from './ResultReveal';
import { SourceChip } from './SourceChip';
import { TransparencyPanel } from './TransparencyPanel';
import styles from './PersonalizedReport.module.css';

type ProfileProps = { profile: PersonalityProfile; locale?: ProfileLocale };
type Props = ProfileProps & { onShare: () => void };
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
      <Typography as="h2" id={id} tabIndex={-1} variant="heading-lg">
        {title}
      </Typography>
      {lead ? <Typography className={styles.muted}>{lead}</Typography> : null}
    </Stack>
  );
}

export function PortraitMap({ profile, locale = profile.locale }: ProfileProps) {
  const copy = reportCopy[locale];
  const repeatedDescriptions = [
    ...new Set(profile.portraitFacets.map((facet) => facet.description)),
  ].filter(
    (description) =>
      profile.portraitFacets.filter((facet) => facet.description === description).length > 1,
  );
  const sharedNoteId = (description: string) => {
    const index = repeatedDescriptions.indexOf(description);
    return index >= 0 ? `portrait-map-note-${index}` : undefined;
  };
  return (
    <section aria-labelledby="portrait-map-title" className={styles.themeMap} id="portrait-map">
      <SectionHeading
        eyebrow={copy.mapEyebrow}
        id="portrait-map-title"
        lead={copy.mapLead}
        title={copy.mapTitle}
      />
      <details className={styles.morePatterns}>
        <summary>{copy.mapOpen}</summary>
        <div className={styles.map}>
          <div aria-hidden="true" className={styles.mapCore}>
            <span>{copy.core}</span>
          </div>
          <svg
            aria-hidden="true"
            className={styles.mapLines}
            preserveAspectRatio="none"
            viewBox="0 0 800 440"
          >
            <path d="M400 220 Q340 110 220 70" />
            <path d="M400 220 Q460 110 580 70" />
            <path d="M400 220 580 220" />
            <path d="M400 220 Q460 330 580 370" />
            <path d="M400 220 Q340 330 220 370" />
            <path d="M400 220 220 220" />
            <ellipse cx="400" cy="220" rx="85" ry="170" />
          </svg>
          {profile.portraitFacets.map((facet, index) => (
            <a
              aria-describedby={sharedNoteId(facet.description)}
              className={styles.facet}
              data-position={index + 1}
              href={`#${facet.targetId}`}
              key={facet.id}
            >
              <span className={styles.facetLabel} lang={profile.locale}>
                {facet.label}
                <span aria-hidden="true">↗</span>
              </span>
              <strong lang={profile.locale}>{facet.title}</strong>
              {!sharedNoteId(facet.description) ? (
                <span className={styles.facetReveal} lang={profile.locale}>
                  {facet.description}
                </span>
              ) : null}
            </a>
          ))}
        </div>
        {repeatedDescriptions.length ? (
          <div className={styles.mapNotes} lang={profile.locale}>
            {repeatedDescriptions.map((description) => (
              <p id={sharedNoteId(description)} key={description}>
                {description}
              </p>
            ))}
          </div>
        ) : null}
      </details>
    </section>
  );
}

function PatternSection({
  profile,
  locale = profile.locale,
  expanded,
  toggle,
}: {
  profile: PersonalityProfile;
  locale?: ProfileLocale;
  expanded: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const copy = reportCopy[locale];
  const seen = new Set<string>();
  const unique = [...profile.strengths, ...profile.growthAreas].filter((insight) => {
    const key = insight.traitIds.length
      ? [...insight.traitIds].sort().join(':')
      : insight.title.trim().toLocaleLowerCase(profile.locale);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const primary = unique.slice(0, 3);
  const more = unique.slice(3);
  return (
    <PortraitChapter id="patterns">
      <SectionHeading
        eyebrow={copy.patternsEyebrow}
        id="patterns-title"
        lead={copy.patternsLead}
        title={copy.patternsTitle}
      />
      <div className={styles.patternGrid}>
        {primary.map((insight, index) => (
          <ExplainCard
            contentLocale={profile.locale}
            className={styles.primaryInsight}
            expanded={expanded(insight.id)}
            insight={insight}
            key={insight.id}
            locale={locale}
            onToggle={toggle}
            order={index}
          />
        ))}
      </div>
      {more.length ? (
        <details className={styles.morePatterns}>
          <summary>{copy.morePatterns}</summary>
          <div className={styles.secondaryPatterns}>
            {more.map((insight, index) => (
              <ExplainCard
                contentLocale={profile.locale}
                expanded={expanded(insight.id)}
                insight={insight}
                key={insight.id}
                locale={locale}
                onToggle={toggle}
                order={index}
              />
            ))}
          </div>
        </details>
      ) : null}
      <PortraitMap profile={profile} locale={locale} />
      <PortraitSectionTransition contained from="patterns" locale={locale} to="communication" />
    </PortraitChapter>
  );
}

function ContrastSection({ profile, locale = profile.locale }: ProfileProps) {
  const [activeView, setActiveView] = useState<Record<string, 'usual' | 'when'>>({});
  if (!profile.contrasts.length) return null;
  const copy = reportCopy[locale];
  return (
    <PortraitChapter id="contrasts" className={styles.contrastSection}>
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
                aria-controls={`${contrast.id}-usual-panel`}
                aria-pressed={(activeView[contrast.id] ?? 'usual') === 'usual'}
                id={`${contrast.id}-usual-control`}
                onClick={() => setActiveView((current) => ({ ...current, [contrast.id]: 'usual' }))}
                prominence="quiet"
              >
                {copy.usual}
              </Button>
              <Button
                aria-controls={`${contrast.id}-when-panel`}
                aria-pressed={activeView[contrast.id] === 'when'}
                id={`${contrast.id}-when-control`}
                onClick={() => setActiveView((current) => ({ ...current, [contrast.id]: 'when' }))}
                prominence="quiet"
              >
                {copy.when}
              </Button>
            </div>
            <div className={styles.contrastPair}>
              <div
                aria-labelledby={`${contrast.id}-usual-control`}
                data-panel="usual"
                id={`${contrast.id}-usual-panel`}
              >
                <span className={styles.contrastPanelLabel}>{copy.usual}</span>
                <p lang={profile.locale}>{contrast.usual}</p>
              </div>
              <div
                aria-labelledby={`${contrast.id}-when-control`}
                data-panel="when"
                id={`${contrast.id}-when-panel`}
              >
                <span className={styles.contrastPanelLabel}>{copy.when}</span>
                <p lang={profile.locale}>{contrast.context}</p>
              </div>
            </div>
            <div className={styles.contrastMeaning}>
              <div>
                <strong>{copy.means}</strong>
                <p lang={profile.locale}>{contrast.meaning}</p>
              </div>
              <div>
                <strong>{copy.try}</strong>
                <p lang={profile.locale}>{contrast.suggestion}</p>
              </div>
            </div>
            <div className={styles.sourceRow}>
              {contrast.sources.map((source) => (
                <SourceChip key={source.id} locale={locale} source={source} />
              ))}
            </div>
          </Card>
        ))}
      </div>
      <PortraitSectionTransition contained from="contrasts" locale={locale} to="recommendations" />
    </PortraitChapter>
  );
}

function Narrative({
  continuation,
  eyebrow,
  expanded,
  id,
  insights,
  locale,
  contentLocale = locale,
  title,
  toggle,
}: {
  continuation: ReactNode;
  eyebrow: string;
  expanded: (id: string) => boolean;
  id: string;
  insights: readonly Insight[];
  locale: PersonalityProfile['locale'];
  contentLocale?: ProfileLocale;
  title: string;
  toggle: (id: string) => void;
}) {
  return (
    <PortraitChapter
      id={id}
      className={id === 'communication' ? styles.communicationSection : styles.energySection}
    >
      <SectionHeading eyebrow={eyebrow} id={`${id}-title`} title={title} />
      <div className={styles.narrativeGrid}>
        {insights.map((insight, index) => (
          <ExplainCard
            contentLocale={contentLocale}
            expanded={expanded(insight.id)}
            insight={insight}
            key={insight.id}
            locale={locale}
            onToggle={toggle}
            order={index}
          />
        ))}
      </div>
      {continuation}
    </PortraitChapter>
  );
}

function Recommendations({ profile, locale = profile.locale }: ProfileProps) {
  const copy = reportCopy[locale];
  const [reactions, setReactions] = useState<Record<string, RecommendationReaction>>({});
  const tryButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  return (
    <PortraitChapter id="recommendations">
      <SectionHeading
        eyebrow={copy.recommendationsEyebrow}
        id="recommendations-title"
        lead={copy.recommendationsLead}
        title={copy.recommendationsTitle}
      />
      <div className={styles.recommendations}>
        {profile.recommendations.map((item: PersonalityRecommendation) => (
          <Card className={styles.recommendation} data-reaction={reactions[item.id]} key={item.id}>
            <div className={styles.recommendationHeader}>
              <Badge tone="info">{copy.categories[item.category]}</Badge>
            </div>
            <Stack className={styles.recommendationBody} gap="md">
              <Typography
                as="h3"
                lang={profile.locale}
                id={`${item.id}-recommendation-title`}
                variant="heading-sm"
              >
                {item.title}
              </Typography>
              <div className={styles.actionCopy}>
                <strong>{copy.action}</strong>
                <Typography lang={profile.locale}>{item.description}</Typography>
              </div>
              <div className={styles.actionReason}>
                <strong>{copy.why}</strong>
                <Typography className={styles.muted} lang={profile.locale}>
                  {item.explanation}
                </Typography>
              </div>
              <div className={styles.actionContext}>
                <strong>{copy.context}</strong>
                <Typography className={styles.muted} lang={profile.locale}>
                  {item.context}
                </Typography>
              </div>
              {reactions[item.id] === 'want' ? (
                <div className={styles.miniPlan}>
                  <strong>{copy.planReady}</strong>
                  <span>
                    {copy.firstStep}: <span lang={profile.locale}>{item.actionLabel}</span>
                  </span>
                  <Button
                    onClick={() => {
                      setReactions((current) => {
                        const next = { ...current };
                        delete next[item.id];
                        return next;
                      });
                      tryButtons.current[item.id]?.focus({ preventScroll: true });
                    }}
                    prominence="quiet"
                  >
                    {copy.undo}
                  </Button>
                </div>
              ) : null}
              <span className={styles.feedbackLabel}>{copy.responseLabel}</span>
              <div
                aria-label={copy.responseLabel}
                aria-describedby={`${item.id}-recommendation-title`}
                className={styles.reactionGroup}
                role="group"
              >
                {(['want', 'notMe', 'already'] as const).map((reaction) => (
                  <Button
                    aria-pressed={reactions[item.id] === reaction}
                    ref={
                      reaction === 'want'
                        ? (element) => {
                            tryButtons.current[item.id] = element;
                          }
                        : undefined
                    }
                    key={reaction}
                    onClick={() => setReactions((current) => ({ ...current, [item.id]: reaction }))}
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
      <PortraitSectionTransition
        contained
        from={profile.interpretations.length ? 'recommendations' : 'recommendationsToFinish'}
        locale={locale}
        to={profile.interpretations.length ? 'interpretations' : 'portrait-finish'}
      />
    </PortraitChapter>
  );
}

function Interpretations({ profile, locale = profile.locale }: ProfileProps) {
  const copy = reportCopy[locale];
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const [detailed, setDetailed] = useState<readonly string[]>([]);
  const [status, setStatus] = useState('');
  if (!profile.interpretations.length) return null;
  const visible = profile.interpretations.filter((item) => !hidden.includes(item.id));
  return (
    <PortraitChapter id="interpretations" quiet>
      <SectionHeading
        eyebrow={copy.interpretationEyebrow}
        id="interpretations-title"
        lead={copy.interpretationLead}
        title={copy.interpretationTitle}
      />
      <div className={styles.interpretations}>
        {visible.map((item) => {
          const artwork = item.sources.some((source) => source.id === 'zodiac')
            ? findPortraitZodiacArtwork(item.title, profile.locale)
            : undefined;
          const body = (
            <Stack gap="md">
              <div className={styles.sourceRow}>
                {item.sources.map((source) => (
                  <SourceChip key={source.id} locale={locale} source={source} />
                ))}
              </div>
              {!artwork ? (
                <Typography as="h3" lang={profile.locale} variant="heading-sm">
                  {item.title}
                </Typography>
              ) : null}
              <Typography lang={profile.locale}>{item.description}</Typography>
              <div className={styles.interpretationControls}>
                <Button
                  aria-controls={`${item.id}-symbolic-detail`}
                  aria-expanded={detailed.includes(item.id)}
                  onClick={() =>
                    setDetailed((current) =>
                      current.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                  prominence="quiet"
                >
                  {detailed.includes(item.id) ? copy.short : copy.details}
                  <span aria-hidden="true">{detailed.includes(item.id) ? '↑' : '↓'}</span>
                </Button>
              </div>
              <div
                hidden={!detailed.includes(item.id)}
                id={`${item.id}-symbolic-detail`}
                className={styles.interpretationDetail}
              >
                <Typography className={styles.muted} lang={profile.locale}>
                  {item.explanation}
                </Typography>
              </div>
              <Button
                onClick={() => {
                  setHidden((current) => [...new Set([...current, item.id])]);
                  setStatus(copy.hiddenStatus);
                }}
                prominence="quiet"
              >
                {copy.hideLayer}
              </Button>
            </Stack>
          );
          return (
            <Card
              className={`${styles.interpretationCard} ${artwork ? styles.zodiacInterpretation : ''}`}
              data-kind={item.sources[0]?.id}
              key={item.id}
            >
              {artwork ? (
                <ZodiacChapter
                  artwork={artwork}
                  locale={locale}
                  contentLocale={profile.locale}
                  title={item.title}
                >
                  {body}
                </ZodiacChapter>
              ) : (
                <>
                  <svg aria-hidden="true" className={styles.epilogueMark} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="34" />
                    <ellipse cx="50" cy="50" rx="46" ry="17" transform="rotate(-32 50 50)" />
                    <circle cx="50" cy="50" r="3" />
                  </svg>
                  {body}
                </>
              )}
            </Card>
          );
        })}
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
                    <span lang={profile.locale}>{item.title}</span>
                    <Button
                      onClick={() => {
                        setHidden((current) => current.filter((id) => id !== item.id));
                        setStatus(copy.restoredStatus);
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
      <PortraitSectionTransition
        contained
        from="interpretations"
        locale={locale}
        to="portrait-finish"
      />
    </PortraitChapter>
  );
}

export function PersonalizedReport({ onShare, profile, locale = profile.locale }: Props) {
  const copy = reportCopy[locale];
  const { isExpanded, toggle } = useDisclosureState();
  const [opened, setOpened] = useState(false);
  return (
    <div className={styles.root} lang={locale} data-result-locale={profile.locale}>
      <ResultReveal
        locale={locale}
        onOpen={() => setOpened(true)}
        opened={opened}
        profile={profile}
      />
      {opened ? (
        <>
          <ReportSectionNav
            hasContrasts={profile.contrasts.length > 0}
            hasInterpretations={profile.interpretations.length > 0}
            locale={locale}
          />
          <PortraitSummary profile={profile} locale={locale} />
          <PortraitSectionTransition from="summary" locale={locale} to="patterns" />
          <PatternSection locale={locale} expanded={isExpanded} profile={profile} toggle={toggle} />
          <Narrative
            contentLocale={profile.locale}
            eyebrow={copy.communicationEyebrow}
            expanded={isExpanded}
            continuation={
              <PortraitSectionTransition
                contained
                from="communication"
                locale={locale}
                to="energy"
              />
            }
            id="communication"
            insights={profile.communication.items}
            locale={locale}
            title={copy.communicationTitle}
            toggle={toggle}
          />
          <Narrative
            contentLocale={profile.locale}
            eyebrow={copy.energyEyebrow}
            expanded={isExpanded}
            continuation={
              <PortraitSectionTransition
                contained
                from={profile.contrasts.length ? 'energy' : 'energyToActions'}
                locale={locale}
                to={profile.contrasts.length ? 'contrasts' : 'recommendations'}
              />
            }
            id="energy"
            insights={profile.energy.items}
            locale={locale}
            title={copy.energyTitle}
            toggle={toggle}
          />
          <ContrastSection profile={profile} locale={locale} />
          <Recommendations profile={profile} locale={locale} />
          <Interpretations profile={profile} locale={locale} />
          <TransparencyPanel locale={locale} />
          <SourcesSection
            contentLocale={profile.locale}
            isExpanded={isExpanded}
            items={profile.sourceDetails}
            locale={locale}
            onToggle={toggle}
          />
          <section
            aria-labelledby="report-final-title"
            className={styles.final}
            id="portrait-finish"
          >
            <Container size="wide">
              <Surface className={styles.finalSurface} elevation="low">
                <div className={styles.finalGrid}>
                  <div aria-hidden="true" className={styles.finalMark}>
                    <PortraitMark identity={profile.visualIdentity} size="lg" />
                  </div>
                  <Stack align="start" className={styles.finalCopy} gap="md">
                    <Typography as="p" variant="eyebrow">
                      {copy.finalEyebrow}
                    </Typography>
                    <Typography as="h2" id="report-final-title" tabIndex={-1} variant="heading-lg">
                      {copy.finalTitle}
                    </Typography>
                    <Typography className={styles.muted}>{copy.finalLead}</Typography>
                    {profile.recommendations[0] ? (
                      <p className={styles.finalTakeaway} lang={profile.locale}>
                        {profile.recommendations[0].description}
                      </p>
                    ) : null}
                    <a
                      className={styles.transitionLink}
                      href="#recommendations"
                      onClick={(event) => {
                        if (
                          event.button !== 0 ||
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey
                        )
                          return;
                        event.preventDefault();
                        navigateToPortraitSection('recommendations', true);
                      }}
                    >
                      {copy.finalRevisit}
                      <span aria-hidden="true">→</span>
                    </a>
                    <Typography variant="caption" className={styles.muted}>
                      {productContractCopy[locale].portraitLifetime}
                    </Typography>
                  </Stack>
                  <Button
                    className={styles.closingAction}
                    onClick={onShare}
                    prominence="secondary"
                    size="large"
                  >
                    {copy.share} <span aria-hidden="true">↗</span>
                  </Button>
                </div>
              </Surface>
            </Container>
          </section>
        </>
      ) : null}
    </div>
  );
}
