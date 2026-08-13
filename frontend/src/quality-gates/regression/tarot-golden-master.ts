import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { getTarotArtwork } from '../../assets/tarot';
import { QualityAssertions } from '../assertions';

const goldenStatuses = ['not-started', 'candidate', 'review', 'approved', 'rejected'];
const scoreCategories = [
  'composition',
  'lighting',
  'perspective',
  'depth',
  'anatomy',
  'materials',
  'color',
  'symbolism',
  'recognizability',
  'collectibleQuality',
  'overallImpression',
];
const reviewWarnings = [
  'croppingRisk',
  'lowContrast',
  'possibleAiArtifact',
  'unreadableHand',
  'unreadableFace',
  'compositionImbalance',
  'perspectiveIssue',
];
const requiredPasses = [
  'immediatelyRecognizableAsTheFool',
  'allSixPrimarySymbolsPresent',
  'noBakedTextOrFrame',
  'noAnatomyDefect',
  'noObviousAiArtifact',
  'visuallySuperiorToClassicScan',
  'suitableAsStyleReferenceForFutureCards',
  'canonicalOrientationUpright',
  'reviewerExplicitApproval',
];

type GoldenMasterCard = {
  cardId: string;
  checksum?: string;
  goldenMasterApprovalNotes?: string;
  goldenMasterApprovedBy?: string;
  goldenMasterCandidateVersion: number;
  goldenMasterReferenceChecksum?: string;
  goldenMasterReviewStatus: string;
  goldenMasterStatus: string;
  goldenMasterStyleVersion: string;
  goldenMasterVersion: string;
  isGoldenMaster: boolean;
  outputPath: string;
  productionStatus: string;
  reviewPath?: string;
  styleVersion: string;
  symbolismChecklist: string[];
  version: number;
};

export function runTarotGoldenMasterGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const productionRoot = resolve(rootDir, 'premium-production');
  const manifest = JSON.parse(
    readFileSync(resolve(productionRoot, 'production-manifest.json'), 'utf8'),
  );
  const cards = manifest.cards as GoldenMasterCard[];
  const goldenCards = cards.filter((card) => card.isGoldenMaster);
  const golden = goldenCards[0];
  const styleV1 = JSON.parse(readFileSync(resolve(productionRoot, 'style-lock.json'), 'utf8'));
  const styleV2 = JSON.parse(readFileSync(resolve(productionRoot, 'style-lock-v2.json'), 'utf8'));
  const rubric = JSON.parse(
    readFileSync(resolve(productionRoot, 'golden-master/rubric.json'), 'utf8'),
  );
  const prompt = readFileSync(resolve(productionRoot, 'prompts/major-fool.md'), 'utf8');
  const handoff = readFileSync(
    resolve(productionRoot, 'golden-master/the-fool-generation.txt'),
    'utf8',
  );
  const release = JSON.parse(
    readFileSync(
      resolve(rootDir, 'src/assets/tarot/metadata/premium-release-manifest.json'),
      'utf8',
    ),
  );
  const studioTemplate = readFileSync(
    resolve(productionRoot, 'golden-master/studio-template.html'),
    'utf8',
  );
  const studioGenerator = readFileSync(
    resolve(rootDir, 'scripts/premium-tarot/golden-review.mjs'),
    'utf8',
  );

  assertions.assert(
    goldenCards.length === 1 &&
      golden?.cardId === 'major-fool' &&
      cards.every((card) => card.cardId === 'major-fool' || !card.isGoldenMaster),
    {
      actual: goldenCards.length,
      code: 'golden-master-single-fool',
      expected: 1,
      message: 'Exactly one Golden Master must exist and it must be The Fool.',
    },
  );
  assertions.assert(
    [
      'Candidate version',
      'Style version',
      'Checksum',
      'Dimensions',
      'Aspect ratio',
      'Color profile',
      'File size',
      'Review status',
      'Previous attempts',
      'Generation date',
      'Reviewer',
    ].every((label) => studioTemplate.includes(label)),
    {
      code: 'golden-master-studio-metadata',
      message: 'Comparison Studio must expose the complete automatic candidate metadata set.',
    },
  );
  assertions.assert(
    Boolean(golden) &&
      goldenStatuses.includes(golden.goldenMasterStatus) &&
      golden.goldenMasterVersion === 'premium-tarot-golden-master-v1' &&
      golden.goldenMasterCandidateVersion === golden.version &&
      golden.goldenMasterStyleVersion === 'premium-tarot-style-v2' &&
      golden.styleVersion === 'premium-tarot-style-v2',
    {
      code: 'golden-master-model',
      message: 'The Fool Golden Master state or version contract is invalid.',
    },
  );
  assertions.assert(
    styleV1.version === 'premium-tarot-style-v1' &&
      styleV2.version === 'premium-tarot-style-v2' &&
      styleV2.status === 'golden-master-candidate' &&
      styleV2.supersedesForGoldenMaster === styleV1.version &&
      styleV2.outputContract?.canonicalOrientation === 'upright',
    {
      code: 'golden-master-style-v2',
      message: 'Style v2 must refine, not delete, the v1 production lock.',
    },
  );
  assertions.assert(
    golden?.symbolismChecklist.length === 6 &&
      [
        'traveler at cliff edge',
        'small white dog',
        'white rose',
        'bundle on staff',
        'distant mountains',
        'bright sun',
      ].every((symbol) => prompt.includes(symbol)) &&
      prompt.includes('premium-tarot-style-v2') &&
      prompt.includes('allowing naturalistic pose refinement') &&
      !prompt.includes('Do not change the exact pose'),
    {
      code: 'golden-master-fool-prompt',
      message:
        'The Fool v2 prompt must preserve identity while allowing naturalistic art direction.',
    },
  );
  assertions.assert(
    handoff.startsWith('FINAL PROMPT\n') &&
      handoff.includes('\nNEGATIVE PROMPT\n') &&
      handoff.includes('\nOUTPUT REQUIREMENTS\n') &&
      !handoff.includes('Review checklist') &&
      !handoff.includes('implementation') &&
      !handoff.includes('premium-production/'),
    {
      code: 'golden-master-generation-handoff',
      message: 'Golden Master handoff must contain only artistic prompt, negatives, and output.',
    },
  );
  assertions.assert(
    rubric.version === 'premium-tarot-golden-review-v1' &&
      JSON.stringify(rubric.reviewSections) === JSON.stringify(scoreCategories) &&
      JSON.stringify(rubric.reviewWarnings) === JSON.stringify(reviewWarnings) &&
      JSON.stringify(rubric.requiredPasses) === JSON.stringify(requiredPasses) &&
      rubric.scale.approvalMinimumPerCategory === 4,
    {
      code: 'golden-master-rubric',
      message: 'Golden Master approval must retain every strict human review criterion.',
    },
  );

  assertions.assert(
    [
      'Classic',
      'Candidate',
      'Side-by-side',
      'Overlay',
      'Split view',
      'Difference',
      'Opacity',
      '25%',
      '50%',
      '100%',
      '200%',
      '400%',
    ].every((control) => studioTemplate.includes(control)) &&
      studioTemplate.includes("addEventListener('pointermove'") &&
      studioTemplate.includes('mix-blend-mode: difference') &&
      studioTemplate.includes('clip-path: inset'),
    {
      code: 'golden-master-comparison-studio',
      message: 'Comparison Studio must retain all non-destructive view, zoom, and pan tools.',
    },
  );
  assertions.assert(
    scoreCategories.every((section) => rubric.reviewSections.includes(section)) &&
      reviewWarnings.every((warning) => rubric.reviewWarnings.includes(warning)) &&
      studioTemplate.includes('Mandatory symbolism') &&
      studioTemplate.includes('Review history') &&
      studioTemplate.includes('Golden Master decision') &&
      studioTemplate.includes('Download review JSON') &&
      studioGenerator.includes('goldenMasterHistory'),
    {
      code: 'golden-master-studio-review-contract',
      message: 'Comparison Studio must expose rubric, symbolism, warnings, history, and decisions.',
    },
  );
  assertions.assert(
    studioTemplate.includes('No automated detection or scoring is performed.') &&
      !studioTemplate.includes('/src/') &&
      !studioGenerator.includes('src/features/tarot'),
    {
      code: 'golden-master-studio-production-isolation',
      message: 'The review studio must remain human-scored production tooling, not a runtime UI.',
    },
  );

  const isApproved = golden?.goldenMasterStatus === 'approved';
  assertions.assert(
    !isApproved ||
      (golden.goldenMasterReviewStatus === 'approved' &&
        Boolean(golden.goldenMasterApprovedBy) &&
        Boolean(golden.goldenMasterApprovalNotes) &&
        Boolean(golden.checksum) &&
        golden.goldenMasterReferenceChecksum === golden.checksum &&
        Boolean(golden.reviewPath) &&
        existsSync(resolve(rootDir, golden.reviewPath ?? '__missing-review__')) &&
        existsSync(resolve(productionRoot, 'golden-master/reference.json'))),
    {
      code: 'golden-master-human-approval',
      message: 'An approved Golden Master requires explicit human provenance and reference record.',
    },
  );
  assertions.assert(
    release.mode === 'classic' &&
      release.records.length === 0 &&
      manifest.releaseMode === 'classic',
    {
      code: 'golden-master-classic-fallback',
      message: 'A Golden Master candidate or approval must never activate a partial premium deck.',
    },
  );
  const classicFool = getTarotArtwork('major-fool');
  assertions.assert(classicFool.editionId === 'rws-archival-classic', {
    code: 'golden-master-provider-fallback',
    message: 'Production artwork resolution must remain on the classic Fool.',
  });

  const importSource = readFileSync(resolve(rootDir, 'scripts/premium-tarot/import.mjs'), 'utf8');
  const previewSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/golden-master-preview.ts'),
    'utf8',
  );
  assertions.assert(
    !importSource.includes("goldenMasterStatus: 'approved'") &&
      importSource.includes("goldenMasterStatus: 'review'") &&
      previewSource.includes('import.meta.env.DEV') &&
      previewSource.includes("'major-fool'") &&
      previewSource.includes('URLSearchParams') &&
      !previewSource.includes('localStorage') &&
      !previewSource.includes('sessionStorage'),
    {
      code: 'golden-master-import-preview-safety',
      message:
        'Golden Master import cannot auto-approve and preview must remain ephemeral and dev-only.',
    },
  );

  const builtJavaScript = readdirSync(resolve(rootDir, 'dist/assets'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(resolve(rootDir, 'dist/assets', name), 'utf8'))
    .join('');
  assertions.assert(
    !builtJavaScript.includes('tarotGoldenMaster') &&
      !builtJavaScript.includes('golden-master-runtime-preview.jpg') &&
      !builtJavaScript.includes('premium-tarot-golden-review-v1') &&
      !builtJavaScript.includes('allSixPrimarySymbolsPresent'),
    {
      code: 'golden-master-production-isolation',
      message:
        'Golden Master preview, prompt, and review tooling must not enter production JavaScript.',
    },
  );

  return assertions.result({ fixtureCount: 1 });
}
