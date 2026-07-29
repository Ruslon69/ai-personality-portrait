import { useEffect } from 'react';

import { useDisclosureState } from '../hooks';
import {
  InsightGridSection,
  NarrativeSection,
  OverviewSection,
  RecommendationsSection,
  ReportHero,
  SourcesSection,
} from '../sections';
import type { PersonalityReportData } from '../types';
import styles from './PersonalityReport.module.css';

type PersonalityReportProps = {
  onShare: () => void;
  report: PersonalityReportData;
};

export function PersonalityReport({ onShare, report }: PersonalityReportProps) {
  const { isExpanded, toggle } = useDisclosureState([report.overview.id]);

  useEffect(() => {
    window.requestAnimationFrame(() => document.getElementById('full-report-title')?.focus());
  }, []);

  return (
    <div className={styles.root}>
      <ReportHero
        createdAt={report.createdAt}
        greeting={report.greeting}
        introduction={report.introduction}
        onShare={onShare}
      />
      <OverviewSection
        expanded={isExpanded(report.overview.id)}
        item={report.overview}
        onToggle={toggle}
      />
      <InsightGridSection
        description="Не абсолютные качества, а способы действовать, которые могут поддерживать вас в разных ситуациях."
        eyebrow="Основные сильные стороны"
        id="strengths"
        isExpanded={isExpanded}
        items={report.strengths}
        onToggle={toggle}
        title="То, на что можно опираться"
      />
      <InsightGridSection
        description="Мягкие направления для эксперимента — без оценок, давления и требования меняться."
        eyebrow="Возможные зоны роста"
        id="growth"
        isExpanded={isExpanded}
        items={report.growthAreas}
        onToggle={toggle}
        title="Что можно сделать ещё удобнее"
      />
      <NarrativeSection isExpanded={isExpanded} onToggle={toggle} section={report.communication} />
      <NarrativeSection isExpanded={isExpanded} onToggle={toggle} section={report.energy} />
      <RecommendationsSection
        isExpanded={isExpanded}
        items={report.recommendations}
        onToggle={toggle}
      />
      <SourcesSection isExpanded={isExpanded} items={report.sources} onToggle={toggle} />
    </div>
  );
}
