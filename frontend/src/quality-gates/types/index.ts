export type QualityGateGroup =
  | 'architecture'
  | 'content'
  | 'interpretation'
  | 'journey-memory'
  | 'numerology'
  | 'privacy'
  | 'product-storage'
  | 'regression'
  | 'serialization'
  | 'storage-activation'
  | 'tarot';

export type QualityGateStatus = 'failed' | 'passed' | 'skipped' | 'warning';
export type QualityGateSeverity = 'error' | 'fatal' | 'warning';

export type QualityGateFailure = {
  actual?: string | number;
  code: string;
  expected?: string | number;
  file?: string;
  line?: number;
  message: string;
  recommendation?: string;
};

export type QualityGateWarning = Omit<QualityGateFailure, 'code'> & { code: string };

export type QualityGateMetadata = {
  affectedModules: readonly string[];
  moduleVersions: Readonly<Record<string, string>>;
  slow: boolean;
  tags: readonly string[];
};

export type QualityGateResult = {
  assertions: number;
  duration: number;
  failures: readonly QualityGateFailure[];
  finishedAt: string;
  fixtures: number;
  id: string;
  metadata: QualityGateMetadata;
  skipped: boolean;
  startedAt: string;
  status: QualityGateStatus;
  warnings: readonly QualityGateWarning[];
};

export type QualityGateSuiteResult = QualityGateResult & {
  group: QualityGateGroup;
  required: boolean;
  severity: QualityGateSeverity;
  title: string;
};

export type QualityGateRunSummary = {
  assertions: number;
  duration: number;
  failures: number;
  finishedAt: string;
  fixtures: number;
  moduleVersions: Readonly<Record<string, string>>;
  passed: boolean;
  results: readonly QualityGateSuiteResult[];
  skipped: number;
  startedAt: string;
  warnings: number;
};

export type QualityGateExecution = {
  assertions: number;
  failures?: readonly QualityGateFailure[];
  fixtureCount?: number;
  moduleVersions?: Readonly<Record<string, string>>;
  skipped?: boolean;
  warnings?: readonly QualityGateWarning[];
};

export type QualityGateRunnerContext = {
  rootDir: string;
};

export type QualityGateDefinition = {
  affectedModules: readonly string[];
  description: string;
  expectedAssertionCount?: number;
  group: QualityGateGroup;
  id: string;
  required: boolean;
  runner: (
    context: QualityGateRunnerContext,
  ) => Promise<QualityGateExecution> | QualityGateExecution;
  severity: QualityGateSeverity;
  tags: readonly string[];
  timeout: number;
  title: string;
};

export type QualityGateFilter = {
  groups?: readonly QualityGateGroup[];
  tags?: readonly string[];
};
