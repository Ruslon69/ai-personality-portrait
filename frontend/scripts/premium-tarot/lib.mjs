import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

import { PILOT_CARD_IDS, PRODUCTION_VERSIONS } from '../../premium-production/catalog.mjs';

export const frontendRoot = resolve(import.meta.dirname, '..', '..');
export const productionRoot = resolve(frontendRoot, 'premium-production');
export const manifestPath = resolve(productionRoot, 'production-manifest.json');
export const styleLockPath = resolve(productionRoot, 'style-lock.json');
export const goldenStyleLockPath = resolve(productionRoot, 'style-lock-v2.json');
export const rubricPath = resolve(productionRoot, 'review-rubric.json');
export const goldenMasterRoot = resolve(productionRoot, 'golden-master');
export const goldenRubricPath = resolve(goldenMasterRoot, 'rubric.json');
export const goldenHandoffPath = resolve(goldenMasterRoot, 'the-fool-generation.txt');
export const goldenReferencePath = resolve(goldenMasterRoot, 'reference.json');
export const promptsRoot = resolve(productionRoot, 'prompts');
export const generatedRoot = resolve(productionRoot, 'generated');
export const goldenRuntimePreviewPath = resolve(generatedRoot, 'golden-master-runtime-preview.jpg');

export const productionStatuses = [
  'pending',
  'prompt-ready',
  'generated',
  'processing',
  'review',
  'approved',
  'rejected',
  'integrated',
];
export const reviewStatuses = ['not-reviewed', 'needs-review', 'approved', 'rejected'];
export const releaseModes = ['classic', 'premium-preview', 'premium-complete'];
export const goldenMasterStatuses = ['not-started', 'candidate', 'review', 'approved', 'rejected'];

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function writeJsonAtomic(path, value) {
  const temporaryPath = `${path}.tmp`;
  await rm(temporaryPath, { force: true });
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
    await rename(temporaryPath, path);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function readProductionManifest() {
  return readJson(manifestPath);
}

export async function readStyleLock(version = PRODUCTION_VERSIONS.style) {
  if (version === PRODUCTION_VERSIONS.style) return readJson(styleLockPath);
  if (version === PRODUCTION_VERSIONS.goldenStyle) return readJson(goldenStyleLockPath);
  throw new Error(`Unknown premium Tarot style version: ${version}`);
}

export function resolveFrontendPath(path) {
  const absolute = resolve(frontendRoot, path);
  const allowedPrefix = `${frontendRoot}${sep}`;
  if (absolute !== frontendRoot && !absolute.startsWith(allowedPrefix)) {
    throw new Error(`Path escapes the frontend workspace: ${path}`);
  }
  return absolute;
}

export function toFrontendPath(path) {
  return relative(frontendRoot, path).split(sep).join('/');
}

export async function sha256(path) {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
}

function nonEmptyStrings(values) {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every((value) => typeof value === 'string' && value.trim())
  );
}

export async function validateProductionManifest(manifest, { checkFiles = true } = {}) {
  const failures = [];
  const cards = Array.isArray(manifest.cards) ? manifest.cards : [];
  const ids = cards.map((card) => card.cardId);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

  if (manifest.schemaVersion !== PRODUCTION_VERSIONS.artwork)
    failures.push('Invalid artwork schema version.');
  if (manifest.styleVersion !== PRODUCTION_VERSIONS.style)
    failures.push('Invalid locked style version.');
  if (manifest.promptVersion !== PRODUCTION_VERSIONS.prompts)
    failures.push('Invalid prompt version.');
  if (manifest.reviewVersion !== PRODUCTION_VERSIONS.review)
    failures.push('Invalid review version.');
  if (!releaseModes.includes(manifest.releaseMode)) failures.push('Invalid release mode.');
  if (cards.length !== 78) failures.push(`Expected 78 production entries; found ${cards.length}.`);
  if (duplicates.length) failures.push(`Duplicate card IDs: ${duplicates.join(', ')}.`);
  if (JSON.stringify(manifest.pilotCardIds) !== JSON.stringify(PILOT_CARD_IDS))
    failures.push('Pilot batch IDs differ from the locked eight-card batch.');
  const goldenMasters = cards.filter((card) => card.isGoldenMaster === true);
  if (
    manifest.goldenMasterCardId !== 'major-fool' ||
    manifest.goldenMasterVersion !== PRODUCTION_VERSIONS.goldenMaster ||
    goldenMasters.length !== 1 ||
    goldenMasters[0]?.cardId !== 'major-fool'
  ) {
    failures.push('Exactly one Golden Master must exist and it must be major-fool.');
  }

  for (const card of cards) {
    const prefix = card.cardId || '<missing-id>';
    const requiredStrings = [
      'cardId',
      'canonicalName',
      'arcana',
      'sourceReferenceId',
      'promptId',
      'styleVersion',
      'paletteFamily',
      'lightingFamily',
      'depthFamily',
      'outputPath',
    ];
    for (const field of requiredStrings) {
      if (typeof card[field] !== 'string' || !card[field].trim())
        failures.push(`${prefix}: missing ${field}.`);
    }
    if (!productionStatuses.includes(card.productionStatus))
      failures.push(`${prefix}: invalid productionStatus.`);
    if (!reviewStatuses.includes(card.reviewStatus))
      failures.push(`${prefix}: invalid reviewStatus.`);
    if (!Number.isInteger(card.version) || card.version < 1)
      failures.push(`${prefix}: invalid version.`);
    if (card.cardId !== 'major-fool' && card.isGoldenMaster !== false)
      failures.push(`${prefix}: only major-fool may be the Golden Master.`);
    if (card.isGoldenMaster) {
      if (!goldenMasterStatuses.includes(card.goldenMasterStatus))
        failures.push(`${prefix}: invalid goldenMasterStatus.`);
      if (!reviewStatuses.includes(card.goldenMasterReviewStatus))
        failures.push(`${prefix}: invalid goldenMasterReviewStatus.`);
      if (
        card.goldenMasterVersion !== PRODUCTION_VERSIONS.goldenMaster ||
        card.goldenMasterCandidateVersion !== card.version ||
        card.goldenMasterStyleVersion !== PRODUCTION_VERSIONS.goldenStyle ||
        card.styleVersion !== PRODUCTION_VERSIONS.goldenStyle
      ) {
        failures.push(`${prefix}: invalid Golden Master version or style lock.`);
      }
      if (card.goldenMasterStatus === 'approved') {
        if (
          card.goldenMasterReviewStatus !== 'approved' ||
          !card.goldenMasterApprovedBy ||
          !card.goldenMasterApprovalNotes ||
          card.goldenMasterReferenceChecksum !== card.checksum
        ) {
          failures.push(`${prefix}: approved Golden Master lacks human provenance.`);
        }
        if (checkFiles && !existsSync(goldenReferencePath))
          failures.push(`${prefix}: approved Golden Master reference record is missing.`);
      }
      if (
        ['review', 'approved'].includes(card.goldenMasterStatus) &&
        (!Number.isInteger(card.candidateMetadata?.width) ||
          !Number.isInteger(card.candidateMetadata?.height) ||
          !Number.isFinite(card.candidateMetadata?.fileSizeBytes) ||
          !card.candidateMetadata?.aspectRatio ||
          !card.candidateMetadata?.colorProfile ||
          !card.candidateMetadata?.generationDate)
      ) {
        failures.push(`${prefix}: Golden Master candidate metadata is incomplete.`);
      }
      const preparation = card.candidateMetadata?.preparation;
      if (
        preparation &&
        (preparation.pipelineVersion !== PRODUCTION_VERSIONS.preparation ||
          !Number.isInteger(preparation.sourceWidth) ||
          !Number.isInteger(preparation.sourceHeight) ||
          !Number.isInteger(preparation.preparedWidth) ||
          !Number.isInteger(preparation.preparedHeight) ||
          typeof preparation.nativeResolutionEligible !== 'boolean' ||
          preparation.preparedResolutionEligible !== true ||
          !preparation.sourceModifiedAt ||
          !preparation.sourceChecksum ||
          !preparation.preparedChecksum)
      ) {
        failures.push(`${prefix}: Golden Master preparation provenance is incomplete.`);
      }
    }
    if (card.arcana === 'minor' && (!card.suit || !card.rank))
      failures.push(`${prefix}: Minor Arcana requires suit and rank.`);
    if (!nonEmptyStrings(card.symbolismChecklist))
      failures.push(`${prefix}: symbolismChecklist must be non-empty.`);
    if (!nonEmptyStrings(card.requiredObjects))
      failures.push(`${prefix}: requiredObjects must be non-empty.`);
    if (!nonEmptyStrings(card.forbiddenChanges))
      failures.push(`${prefix}: forbiddenChanges must be non-empty.`);
    const composition = card.compositionReference;
    for (const field of [
      'mainSubject',
      'poseAndComposition',
      'emotionalTone',
      'foreground',
      'midground',
      'background',
      'framing',
      'referenceAsset',
      'referenceRule',
    ]) {
      if (typeof composition?.[field] !== 'string' || !composition[field].trim())
        failures.push(`${prefix}: incomplete compositionReference.${field}.`);
    }
    if (composition?.referenceAsset) {
      const path = resolveFrontendPath(composition.referenceAsset);
      if (!existsSync(path)) failures.push(`${prefix}: missing classic composition reference.`);
    }
    if (card.productionStatus === 'approved' || card.productionStatus === 'integrated') {
      if (card.reviewStatus !== 'approved')
        failures.push(`${prefix}: active approval lacks approved review status.`);
      if (!card.checksum || !card.outputPath)
        failures.push(`${prefix}: approved asset lacks checksum/outputPath.`);
      if (!card.reviewPath || !card.approvedBy || !card.approvalNotes)
        failures.push(`${prefix}: approved asset lacks explicit human approval provenance.`);
      if (checkFiles && card.outputPath && !existsSync(resolveFrontendPath(card.outputPath)))
        failures.push(`${prefix}: approved output file is missing.`);
      if (checkFiles && card.reviewPath && !existsSync(resolveFrontendPath(card.reviewPath)))
        failures.push(`${prefix}: approved review record is missing.`);
    }
    if (card.productionStatus === 'integrated') {
      if (!card.finalPath || card.reviewStatus === 'rejected')
        failures.push(`${prefix}: invalid integrated record.`);
      if (checkFiles && card.finalPath && !existsSync(resolveFrontendPath(card.finalPath)))
        failures.push(`${prefix}: integrated final file is missing.`);
    }
    if (card.productionStatus === 'rejected') {
      if (card.reviewStatus !== 'rejected' || !card.rejectionReason)
        failures.push(`${prefix}: rejected asset lacks rejection record.`);
    }
  }

  return failures;
}

export function findProductionCard(manifest, cardId) {
  const card = manifest.cards.find((candidate) => candidate.cardId === cardId);
  if (!card) throw new Error(`Unknown Tarot card ID: ${cardId}`);
  return card;
}

export function buildMasterPrompt(card, style) {
  const palette = style.paletteFamilies[card.paletteFamily];
  const lighting = style.lightingFamilies[card.lightingFamily];
  const depth = style.depthFamilies[card.depthFamily];
  const mandatory = card.requiredObjects.join('; ');
  const identity = card.symbolismChecklist.join('; ');
  const exclusions = [...style.globalNegativeConstraints, ...card.forbiddenChanges].join('; ');
  const output = style.outputContract;

  return [
    `CARD TITLE: ${card.canonicalName}.`,
    `RIDER–WAITE SYMBOLIC IDENTITY: Create a semantically faithful Rider–Waite–Smith-inspired interpretation. Preserve these recognizable identity anchors: ${identity}.`,
    `MAIN SUBJECT: ${card.compositionReference.mainSubject}.`,
    `POSE AND COMPOSITION: ${card.compositionReference.poseAndComposition}`,
    `MANDATORY OBJECTS: ${mandatory}. Preserve exact canonical counts and relationships.`,
    `EMOTIONAL TONE: ${card.compositionReference.emotionalTone}. ${style.matureTone}`,
    `FOREGROUND: ${card.compositionReference.foreground}`,
    `MIDGROUND: ${card.compositionReference.midground}`,
    `BACKGROUND: ${card.compositionReference.background}`,
    `LIGHTING: ${lighting} ${style.lighting}`,
    `MATERIAL RENDERING: ${style.materialRendering.join('; ')}.`,
    `PALETTE: ${palette} ${style.contrast}`,
    `DEPTH: ${depth} ${style.depth}`,
    `FRAMING: ${card.compositionReference.framing} ${style.framing}`,
    `REALISM LEVEL: ${style.medium} ${style.realismLevel} ${style.collectibleQuality}`,
    `OUTPUT: Upright ${output.masterRatio} portrait illustration, at least ${output.masterMinimumWidth} by ${output.masterMinimumHeight} pixels, ${output.colorSpace}, illustration only, no transparent outer edges.`,
    `NEGATIVE CONSTRAINTS: ${exclusions}`,
  ].join('\n\n');
}

export function promptFileName(cardId) {
  return `${cardId}.md`;
}

export function buildPromptHandoff(card, style, rubric) {
  const prompt = buildMasterPrompt(card, style);
  return `---\ncardId: ${card.cardId}\ncanonicalName: ${card.canonicalName}\npromptId: ${card.promptId}\nstyleVersion: ${card.styleVersion}\npromptVersion: ${PRODUCTION_VERSIONS.prompts}\nartworkVersion: ${PRODUCTION_VERSIONS.artwork}\neditionId: ${PRODUCTION_VERSIONS.edition}\ncanonicalOrientation: upright\n---\n\n# Final generation prompt\n\n${prompt}\n\n# Negative constraints\n\n${style.globalNegativeConstraints.map((item) => `- ${item}`).join('\n')}\n${card.forbiddenChanges.map((item) => `- ${item}`).join('\n')}\n\n# Symbolism checklist\n\n${card.symbolismChecklist.map((item) => `- [ ] ${item}`).join('\n')}\n\n# Review checklist\n\n${rubric.requiredPasses.map((item) => `- [ ] ${item}`).join('\n')}\n\nScores use the ${rubric.scale.minimum}–${rubric.scale.maximum} rubric in \`premium-production/review-rubric.json\`; approval requires at least ${rubric.scale.approvalMinimumPerCategory} in every category plus explicit human approval.\n`;
}

export function buildGoldenGenerationHandoff(card, style) {
  const prompt = buildMasterPrompt(card, style)
    .split('\n\n')
    .filter(
      (section) => !section.startsWith('OUTPUT:') && !section.startsWith('NEGATIVE CONSTRAINTS:'),
    )
    .join('\n\n');
  const negativePrompt = [...style.globalNegativeConstraints, ...card.forbiddenChanges].join('; ');
  const output = style.outputContract;
  return `FINAL PROMPT\n\n${prompt}\n\nNEGATIVE PROMPT\n\n${negativePrompt}\n\nOUTPUT REQUIREMENTS\n\nPortrait ${output.masterRatio}; minimum ${output.masterMinimumWidth}×${output.masterMinimumHeight}; ${output.colorSpace}; physically upright pixels; illustration only; no transparent edges; no baked card frame; no title; no numeral; no watermark; no UI.\n`;
}

export async function assertRegularFile(path) {
  const details = await stat(path);
  if (!details.isFile()) throw new Error(`Expected a regular file: ${path}`);
  return details;
}

export function parseNamedArguments(argumentsList) {
  const options = new Map();
  const positional = [];
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument?.startsWith('--')) {
      const [key, inlineValue] = argument.slice(2).split('=', 2);
      const value = inlineValue ?? argumentsList[index + 1];
      if (inlineValue === undefined) index += 1;
      options.set(key, value);
    } else if (argument) positional.push(argument);
  }
  return { options, positional };
}

export { PILOT_CARD_IDS, PRODUCTION_VERSIONS };
