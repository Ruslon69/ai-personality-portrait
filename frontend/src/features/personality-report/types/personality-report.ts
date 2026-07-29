export type ReportCardItem = {
  details: string;
  id: string;
  summary: string;
  title: string;
};

export type ReportNarrativeSection = {
  description: string;
  eyebrow: string;
  id: string;
  items: readonly ReportCardItem[];
  title: string;
};

export type ReportRecommendation = ReportCardItem & {
  actionLabel: string;
};

export type ReportSourceStatus = 'included' | 'omitted' | 'interpretation';

export type ReportSource = ReportCardItem & {
  status: ReportSourceStatus;
};

export type PersonalityReportData = {
  createdAt: string;
  energy: ReportNarrativeSection;
  growthAreas: readonly ReportCardItem[];
  greeting: string;
  id: string;
  introduction: string;
  overview: ReportCardItem;
  recommendations: readonly ReportRecommendation[];
  sources: readonly ReportSource[];
  strengths: readonly ReportCardItem[];
  communication: ReportNarrativeSection;
};
