import { runAuthorContentRuntimeSuite } from '../../features/expert-interpretation/fixtures/content-runtime-suite';
import { runExpertInterpretationFixtureSuite } from '../../features/expert-interpretation/fixtures/runtime-suite';
import { runJourneyMemoryRuntimeSuite } from '../../features/journey-memory/fixtures/runtime-suite';
import { runProductStorageActivationRuntimeSuite } from '../../features/product-storage/fixtures/activation-runtime-suite';
import { runProductStorageRuntimeSuite } from '../../features/product-storage/fixtures/runtime-suite';
import { runExpertInterpretationAdapterRuntimeSuite } from '../../features/tarot/lib/expert-interpretation-adapter-runtime';
import { QUALITY_BASELINE } from '../fixtures/baseline';
import type { QualityGateExecution, QualityGateFailure } from '../types';

type ExistingReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

function adapt(
  id: keyof typeof QUALITY_BASELINE.fixtures,
  report: ExistingReport,
  moduleVersions: Readonly<Record<string, string>>,
): QualityGateExecution {
  const failures: QualityGateFailure[] = report.errors.map((message) => ({
    code: `${id}-runtime-failure`,
    message,
  }));
  if (!report.valid && failures.length === 0)
    failures.push({
      code: `${id}-invalid-report`,
      message: 'Suite reported invalid without errors.',
    });
  if (report.fixtureCount < QUALITY_BASELINE.fixtures[id])
    failures.push({
      actual: report.fixtureCount,
      code: `${id}-fixture-regression`,
      expected: QUALITY_BASELINE.fixtures[id],
      message: 'Fixture count dropped below the machine-readable baseline.',
    });
  if (report.assertionCount < QUALITY_BASELINE.assertions[id])
    failures.push({
      actual: report.assertionCount,
      code: `${id}-assertion-regression`,
      expected: QUALITY_BASELINE.assertions[id],
      message: 'Assertion count dropped below the machine-readable baseline.',
    });
  return {
    assertions: report.assertionCount + 2,
    failures,
    fixtureCount: report.fixtureCount,
    moduleVersions,
  };
}

export const existingSuiteRunners = {
  authorContent: () =>
    adapt('authorContent', runAuthorContentRuntimeSuite(), {
      authorContent: QUALITY_BASELINE.moduleVersions.authorContent,
      wording: QUALITY_BASELINE.moduleVersions.wording,
    }),
  expertInterpretation: () =>
    adapt('expertInterpretation', runExpertInterpretationFixtureSuite(), {
      expertInterpretation: QUALITY_BASELINE.moduleVersions.expertInterpretation,
      tarotRules: QUALITY_BASELINE.moduleVersions.tarotRules,
    }),
  journeyMemory: () =>
    adapt('journeyMemory', runJourneyMemoryRuntimeSuite(), {
      chapterEngine: QUALITY_BASELINE.moduleVersions.chapterEngine,
      journeyMemory: QUALITY_BASELINE.moduleVersions.journeyMemory,
    }),
  productStorage: () =>
    adapt('productStorage', runProductStorageRuntimeSuite(), {
      productStorage: QUALITY_BASELINE.moduleVersions.productStorage,
    }),
  storageActivation: () =>
    adapt('storageActivation', runProductStorageActivationRuntimeSuite(), {
      productStorage: QUALITY_BASELINE.moduleVersions.productStorage,
    }),
};

export function runPresentationAdapterGate(): QualityGateExecution {
  const report = runExpertInterpretationAdapterRuntimeSuite();
  return {
    assertions: report.assertionCount,
    failures: report.errors.map((message) => ({
      code: 'presentation-adapter-failure',
      message,
    })),
    moduleVersions: {
      authorContent: QUALITY_BASELINE.moduleVersions.authorContent,
      expertInterpretation: QUALITY_BASELINE.moduleVersions.expertInterpretation,
    },
  };
}
