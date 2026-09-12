import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  RWS_CLASSIC_DECK_ID,
  TAROT_ARTWORK_CONTRACT_VERSION,
  getTarotArtwork,
  hasRequiredTarotArtworkLayers,
  selectTarotArtworkVariant,
  tarotArtworkManifest,
  tarotArtworkProviders,
  type TarotArtworkVariant,
} from '../../assets/tarot';
import rwsOrientationManifest from '../../assets/tarot/metadata/rws-orientation-manifest.json';
import { rwsPublicDomainManifest } from '../../assets/tarot/metadata/rws-public-domain-manifest';
import { TarotCardView } from '../../features/tarot/components/TarotCardView';
import { resolveTarotCardVisualFace } from '../../features/tarot/components/tarot-card-visual-state';
import { getTarotArtworkRotation } from '../../features/tarot/components/tarot-artwork-orientation';
import { shouldLoadTarotFaceArtwork } from '../../features/tarot/components/tarot-artwork-loading';
import { standardTarotDeck } from '../../features/tarot/data';
import { QualityAssertions } from '../assertions';
import { QUALITY_BASELINE } from '../fixtures/baseline';

type JpegDimensions = { height: number; width: number };

function jpegDimensions(buffer: Buffer): JpegDimensions | null {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === undefined) return null;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
      offset += 2;
      continue;
    }
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2 || offset + segmentLength + 2 > buffer.length) return null;
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += segmentLength + 2;
  }
  return null;
}

function collectJpegs(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .sort()
    .flatMap((name) => {
      const path = join(directory, name);
      return statSync(path).isDirectory()
        ? collectJpegs(path)
        : extname(path).toLowerCase() === '.jpg'
          ? [path]
          : [];
    });
}

function duplicates(values: readonly string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))].sort();
}

export function runTarotArtworkGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const tarotAssetRoot = resolve(rootDir, 'src/assets/tarot');
  const artworkRoot = resolve(tarotAssetRoot, 'cards/rws');
  const localFiles = collectJpegs(artworkRoot);
  const distRoot = resolve(rootDir, 'dist');
  const builtArtworkFiles = collectJpegs(distRoot);
  const canonicalIds = standardTarotDeck.cards.map((card) => card.id).sort();
  const manifestIds = rwsPublicDomainManifest.map((record) => record.cardId).sort();
  const localPaths = rwsPublicDomainManifest.map((record) => record.localAssetPath);
  const checksums = rwsPublicDomainManifest.map((record) => record.checksum);
  const premiumReleaseActive = getTarotArtwork('major-fool').quality === 'premium';
  const expectedBuiltArtworkCount =
    QUALITY_BASELINE.tarotCardCount * (premiumReleaseActive ? 2 : 1);
  const duplicateChecksums = duplicates(checksums);
  const orientationIds = rwsOrientationManifest.reviewRecords.map((record) => record.cardId).sort();

  assertions.assert(rwsPublicDomainManifest.length === QUALITY_BASELINE.tarotCardCount, {
    actual: rwsPublicDomainManifest.length,
    code: 'rws-manifest-coverage',
    expected: QUALITY_BASELINE.tarotCardCount,
    message: 'The RWS rights manifest must contain exactly 78 records.',
  });
  assertions.assert(tarotArtworkManifest.size === QUALITY_BASELINE.tarotCardCount, {
    actual: tarotArtworkManifest.size,
    code: 'rws-provider-coverage',
    expected: QUALITY_BASELINE.tarotCardCount,
    message: 'The artwork provider must expose exactly 78 canonical mappings.',
  });
  assertions.assert(localFiles.length === QUALITY_BASELINE.tarotCardCount, {
    actual: localFiles.length,
    code: 'rws-local-file-coverage',
    expected: QUALITY_BASELINE.tarotCardCount,
    message: 'The local RWS runtime collection must contain exactly 78 JPEG assets.',
  });
  assertions.assert(builtArtworkFiles.length === expectedBuiltArtworkCount, {
    actual: builtArtworkFiles.length,
    code: 'rws-built-file-coverage',
    expected: expectedBuiltArtworkCount,
    message:
      'Vite must emit one complete active deck and retain the complete classic fallback deck.',
  });
  const builtIndexPath = resolve(distRoot, 'index.html');
  const builtIndex = existsSync(builtIndexPath) ? readFileSync(builtIndexPath, 'utf8') : '';
  assertions.assert(existsSync(builtIndexPath) && !/\.jpg|image\/jpeg/u.test(builtIndex), {
    code: 'rws-initial-image-preload',
    file: 'dist/index.html',
    message: 'The initial document must not preload or request the 78 Tarot faces.',
  });
  assertions.assert(JSON.stringify(manifestIds) === JSON.stringify(canonicalIds), {
    code: 'rws-canonical-id-mismatch',
    message: 'RWS manifest IDs must match the canonical Tarot deck exactly.',
  });
  assertions.assert(duplicates(manifestIds).length === 0, {
    code: 'rws-duplicate-card-id',
    message: 'RWS manifest card IDs must be unique.',
  });
  assertions.assert(duplicates(localPaths).length === 0, {
    code: 'rws-duplicate-local-path',
    message: 'An RWS local asset path cannot be assigned to more than one card.',
  });
  assertions.assert(
    rwsOrientationManifest.reviewRecords.length === QUALITY_BASELINE.tarotCardCount,
    {
      actual: rwsOrientationManifest.reviewRecords.length,
      code: 'rws-orientation-coverage',
      expected: QUALITY_BASELINE.tarotCardCount,
      message: 'The orientation manifest must explicitly cover all 78 cards.',
    },
  );
  assertions.assert(JSON.stringify(orientationIds) === JSON.stringify(canonicalIds), {
    code: 'rws-orientation-id-mismatch',
    message: 'Orientation records must match the canonical Tarot deck exactly.',
  });
  assertions.assert(duplicates(orientationIds).length === 0, {
    code: 'rws-duplicate-orientation-id',
    message: 'Orientation records must not duplicate card IDs.',
  });
  assertions.warn(duplicateChecksums.length === 0, {
    code: 'rws-duplicate-checksum',
    message: `Unexpected duplicate artwork checksums: ${duplicateChecksums.join(', ')}`,
  });
  assertions.assert(
    rwsPublicDomainManifest.filter((record) => record.arcana === 'major').length === 22,
    { code: 'rws-major-count', message: 'RWS artwork must cover 22 Major Arcana cards.' },
  );
  assertions.assert(
    rwsPublicDomainManifest.filter((record) => record.arcana === 'minor').length === 56,
    { code: 'rws-minor-count', message: 'RWS artwork must cover 56 Minor Arcana cards.' },
  );
  (['wands', 'cups', 'swords', 'pentacles'] as const).forEach((suit) =>
    assertions.assert(
      rwsPublicDomainManifest.filter((record) => 'suit' in record && record.suit === suit)
        .length === 14,
      { code: `rws-${suit}-count`, message: `RWS artwork must cover 14 ${suit} cards.` },
    ),
  );

  let totalBytes = 0;
  let largestBytes = 0;
  rwsPublicDomainManifest.forEach((record) => {
    const path = resolve(tarotAssetRoot, record.localAssetPath);
    const exists = existsSync(path);
    assertions.assert(record.rightsStatus === 'verified-public-domain', {
      code: 'rws-rights-status',
      file: relative(rootDir, path),
      message: `${record.cardId} is not individually verified as public domain.`,
    });
    assertions.assert(
      record.commonsPageReference.startsWith('https://commons.wikimedia.org/wiki/File:'),
      {
        code: 'rws-source-reference',
        file: relative(rootDir, path),
        message: `${record.cardId} lacks an individual Commons file reference.`,
      },
    );
    assertions.assert(record.originalAuthor === 'Pamela Colman Smith', {
      code: 'rws-author-provenance',
      file: relative(rootDir, path),
      message: `${record.cardId} has unexpected author provenance.`,
    });
    assertions.assert(record.originalYear === 1910, {
      code: 'rws-year-provenance',
      file: relative(rootDir, path),
      message: `${record.cardId} has unexpected publication-year provenance.`,
    });
    assertions.assert(exists, {
      code: 'rws-local-asset-missing',
      file: relative(rootDir, path),
      message: `${record.cardId} points to a missing local asset.`,
    });
    assertions.assert(!/^https?:|^data:/u.test(record.localAssetPath), {
      code: 'rws-runtime-hotlink',
      file: relative(rootDir, path),
      message: `${record.cardId} must resolve to a local non-inline runtime asset.`,
    });
    assertions.assert(/^[a-f0-9]{64}$/u.test(record.checksum), {
      code: 'rws-checksum-format',
      file: relative(rootDir, path),
      message: `${record.cardId} must preserve a SHA-256 runtime checksum.`,
    });
    assertions.assert(record.processedFormat === 'jpeg', {
      code: 'rws-processed-format',
      file: relative(rootDir, path),
      message: `${record.cardId} has an unsupported processed format.`,
    });
    assertions.assert(
      record.processedWidth > 0 && record.processedHeight > 0 && record.processedHeight <= 1200,
      {
        code: 'rws-manifest-dimensions',
        file: relative(rootDir, path),
        message: `${record.cardId} has invalid processed dimensions.`,
      },
    );
    if (!exists) return;
    const buffer = readFileSync(path);
    const size = buffer.byteLength;
    totalBytes += size;
    largestBytes = Math.max(largestBytes, size);
    const actualChecksum = createHash('sha256').update(buffer).digest('hex');
    const dimensions = jpegDimensions(buffer);
    const orientation = rwsOrientationManifest.reviewRecords.find(
      (review) => review.cardId === record.cardId,
    );
    assertions.assert(orientation?.canonicalOrientation === 'upright', {
      code: 'rws-canonical-orientation',
      file: relative(rootDir, path),
      message: `${record.cardId} must declare canonical upright source artwork.`,
    });
    assertions.assert(
      orientation?.sourceTransform === orientation?.currentTransform &&
        rwsOrientationManifest.allowedSourceTransforms.includes(
          orientation?.sourceTransform ?? 'invalid',
        ),
      {
        code: 'rws-source-transform-record',
        file: relative(rootDir, path),
        message: `${record.cardId} lacks a valid, explicit source transform.`,
      },
    );
    assertions.assert(orientation?.needsManualReview === false && Boolean(orientation.reason), {
      code: 'rws-orientation-review-complete',
      file: relative(rootDir, path),
      message: `${record.cardId} orientation review is incomplete.`,
    });
    assertions.assert(!buffer.includes(Buffer.from('Exif\0\0')), {
      code: 'rws-runtime-exif-orientation',
      file: relative(rootDir, path),
      message: `${record.cardId} runtime pixels must not rely on EXIF orientation.`,
    });
    assertions.assert(actualChecksum === record.checksum, {
      actual: actualChecksum,
      code: 'rws-checksum-mismatch',
      expected: record.checksum,
      file: relative(rootDir, path),
      message: `${record.cardId} does not match its rights manifest checksum.`,
    });
    assertions.assert(
      dimensions?.width === record.processedWidth && dimensions.height === record.processedHeight,
      {
        actual: dimensions ? `${dimensions.width}x${dimensions.height}` : 'invalid-jpeg',
        code: 'rws-dimension-mismatch',
        expected: `${record.processedWidth}x${record.processedHeight}`,
        file: relative(rootDir, path),
        message: `${record.cardId} dimensions differ from the rights manifest.`,
      },
    );
    const artwork = getTarotArtwork(record.cardId, RWS_CLASSIC_DECK_ID, {
      quality: 'standard',
    });
    assertions.assert(
      Boolean(artwork.faceAsset) &&
        !artwork.isFallback &&
        artwork.rightsStatus === 'verified-public-domain',
      {
        code: 'rws-provider-fallback-unexpected',
        file: relative(rootDir, path),
        message: `${record.cardId} unexpectedly resolves to fallback artwork.`,
      },
    );
    assertions.assert(artwork.aspectRatio === '7 / 12' && artwork.width > 0 && artwork.height > 0, {
      code: 'rws-provider-dimensions',
      file: relative(rootDir, path),
      message: `${record.cardId} provider lacks a stable card layout ratio.`,
    });
    assertions.assert(
      Boolean(artwork.palette.dominantTone) &&
        Boolean(artwork.palette.accentTone) &&
        Boolean(artwork.palette.frameTone) &&
        Boolean(artwork.palette.lightTone),
      {
        code: 'rws-presentation-palette',
        file: relative(rootDir, path),
        message: `${record.cardId} lacks deterministic presentation palette metadata.`,
      },
    );
    assertions.assert(
      artwork.providerId === 'rws-classic-local' &&
        artwork.editionId === 'rws-archival-classic' &&
        artwork.sourceKind === 'scan' &&
        artwork.quality === 'standard' &&
        artwork.renderMode === 'static',
      {
        code: 'rws-provider-version-contract',
        file: relative(rootDir, path),
        message: `${record.cardId} lacks versioned provider and quality metadata.`,
      },
    );
    assertions.assert(
      artwork.layers.length === 1 &&
        artwork.layers[0]?.role === 'midground' &&
        artwork.layers[0]?.required === true &&
        artwork.layers[0]?.asset === artwork.faceAsset &&
        artwork.layers.every(
          (layer) => Number.isFinite(layer.depth) && layer.depth >= -1 && layer.depth <= 1,
        ),
      {
        code: 'rws-static-layer-contract',
        file: relative(rootDir, path),
        message: `${record.cardId} must expose its static source through the layered renderer contract.`,
      },
    );
  });

  assertions.assert(totalBytes <= QUALITY_BASELINE.bundle.maximumTarotArtworkBytes, {
    actual: totalBytes,
    code: 'rws-total-asset-budget',
    expected: QUALITY_BASELINE.bundle.maximumTarotArtworkBytes,
    message: 'The processed RWS deck exceeds its approved total runtime asset budget.',
  });
  assertions.assert(largestBytes <= QUALITY_BASELINE.bundle.maximumTarotArtworkFileBytes, {
    actual: largestBytes,
    code: 'rws-single-asset-budget',
    expected: QUALITY_BASELINE.bundle.maximumTarotArtworkFileBytes,
    message: 'A processed RWS card exceeds the approved per-file runtime asset budget.',
  });
  const missingArtwork = getTarotArtwork('missing-card');
  assertions.assert(missingArtwork.isFallback && missingArtwork.rightsStatus === 'placeholder', {
    code: 'rws-missing-asset-fallback',
    message: 'Unknown artwork must resolve to the internal symbolic fallback.',
  });
  assertions.assert(
    tarotArtworkProviders.length > 0 &&
      tarotArtworkProviders.every(
        (provider) => provider.contractVersion === TAROT_ARTWORK_CONTRACT_VERSION,
      ),
    {
      code: 'tarot-provider-contract-version',
      message: 'Every registered deck provider must implement the current artwork contract.',
    },
  );
  const futureVariants: readonly TarotArtworkVariant[] = [
    {
      artworkVersion: 'future-standard-v1',
      editionId: 'future-edition',
      effects: { fog: false, glow: false, lightRays: false, particles: false },
      faceAsset: '/future-standard.webp',
      layers: [
        {
          asset: '/future-standard.webp',
          depth: 0,
          id: 'midground',
          required: true,
          role: 'midground',
        },
      ],
      quality: 'standard',
      renderMode: 'static',
      sourceKind: 'manual',
    },
    {
      artworkVersion: 'future-premium-v2',
      editionId: 'future-edition',
      effects: { fog: true, glow: true, lightRays: true, particles: true },
      faceAsset: '/future-premium.webp',
      layers: [
        { asset: '/future-bg.webp', depth: -1, id: 'background', role: 'background' },
        {
          asset: '/future-mid.webp',
          depth: 0,
          id: 'midground',
          required: true,
          role: 'midground',
        },
        { asset: '/future-fg.webp', depth: 1, id: 'foreground', role: 'foreground' },
      ],
      quality: 'premium',
      renderMode: 'layered',
      sourceKind: 'ai-painting',
    },
  ];
  assertions.assert(
    selectTarotArtworkVariant(futureVariants, { quality: 'premium' })?.artworkVersion ===
      'future-premium-v2',
    {
      code: 'tarot-provider-quality-switch',
      message: 'A future deck must be able to switch quality without changing card UI code.',
    },
  );
  assertions.assert(
    selectTarotArtworkVariant(futureVariants, { version: 'future-standard-v1' })?.quality ===
      'standard',
    {
      code: 'tarot-provider-version-switch',
      message: 'A deck provider must deterministically select an explicit artwork version.',
    },
  );
  assertions.assert(getTarotArtwork('major-fool', 'future-unregistered-deck').isFallback, {
    code: 'tarot-provider-unknown-deck-fallback',
    message: 'An unregistered future deck must fail safely to symbolic fallback artwork.',
  });
  assertions.assert(
    hasRequiredTarotArtworkLayers(futureVariants[1]?.layers ?? [], ['/future-fg.webp']) &&
      !hasRequiredTarotArtworkLayers(futureVariants[1]?.layers ?? [], ['/future-mid.webp']),
    {
      code: 'tarot-layered-artwork-failure-fallback',
      message: 'Decorative layers may fail independently, but a required semantic plane may not.',
    },
  );
  (['assigned', 'compact', 'history', 'selectable', 'supporting'] as const).forEach((variant) =>
    assertions.assert(!shouldLoadTarotFaceArtwork(false, variant), {
      code: `rws-face-down-loading-${variant}`,
      message: `Face-down ${variant} cards must not request face artwork.`,
    }),
  );
  assertions.assert(shouldLoadTarotFaceArtwork(false, 'revealing'), {
    code: 'rws-reveal-preload',
    message: 'Only the active reveal card may preload its face before the flip completes.',
  });
  assertions.assert(shouldLoadTarotFaceArtwork(false, 'compact', true), {
    code: 'rws-ready-position-preload',
    message: 'The single ready position may preload without exposing its face.',
  });
  assertions.assert(shouldLoadTarotFaceArtwork(true, 'leading'), {
    code: 'rws-leading-load',
    message: 'A revealed leading card must request its face artwork.',
  });
  assertions.assert(
    getTarotArtworkRotation('upright') === '0deg' && getTarotArtworkRotation(undefined) === '0deg',
    {
      code: 'rws-runtime-upright-rotation',
      message: 'Canonical upright artwork must render at zero degrees.',
    },
  );
  assertions.assert(getTarotArtworkRotation('reversed') === '180deg', {
    code: 'rws-runtime-reversed-rotation',
    message: 'Only reversed reading orientation may rotate artwork 180 degrees.',
  });
  const hangedMan = rwsOrientationManifest.reviewRecords.find(
    (record) => record.cardId === 'major-hanged-man',
  );
  assertions.assert(
    hangedMan?.sourceTransform === 'none' &&
      /inverted figure is intentional/u.test(hangedMan.reason),
    {
      code: 'rws-hanged-man-canonical',
      message: 'The Hanged Man figure must not be mistaken for a reversed source card.',
    },
  );
  const cardViewSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotCardView.tsx'),
    'utf8',
  );
  const readingFlowSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/flows/TarotReadingFlow.tsx'),
    'utf8',
  );
  const revealMarkupStart = readingFlowSource.indexOf("{step === 'reveal' ? (");
  const revealMarkupEnd = readingFlowSource.indexOf(
    '<div className={styles.flowActions}',
    revealMarkupStart,
  );
  const revealMarkupSource = readingFlowSource.slice(revealMarkupStart, revealMarkupEnd);
  const revealActionStart = readingFlowSource.indexOf('function handleRevealAction()');
  const revealActionEnd = readingFlowSource.indexOf('const canContinue', revealActionStart);
  const revealActionSource = readingFlowSource.slice(revealActionStart, revealActionEnd);
  const resultSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotResult.tsx'),
    'utf8',
  );
  const historySource = readFileSync(
    resolve(rootDir, 'src/features/journey/components/TarotHistory.tsx'),
    'utf8',
  );
  const historyCss = readFileSync(
    resolve(rootDir, 'src/features/journey/components/TarotHistory.module.css'),
    'utf8',
  );
  const historyPageSource = readFileSync(
    resolve(rootDir, 'src/pages/tarot/TarotHistoryPage.tsx'),
    'utf8',
  );
  const readingPageSource = readFileSync(
    resolve(rootDir, 'src/pages/tarot/TarotReadingPage.tsx'),
    'utf8',
  );
  const tarotLandingSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotLanding.tsx'),
    'utf8',
  );
  const tarotPreferencesSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotPreferencesSection.tsx'),
    'utf8',
  );
  const tarotPreferencesCss = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotPreferencesSection.module.css'),
    'utf8',
  );
  const tarotCopySource = readFileSync(
    resolve(rootDir, 'src/features/tarot/data/tarot-copy.ts'),
    'utf8',
  );
  const tarotSessionSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/model/tarot-session.ts'),
    'utf8',
  );
  const journeyStoreSource = readFileSync(
    resolve(rootDir, 'src/features/journey/model/journey-store.ts'),
    'utf8',
  );
  const settingsPageSource = readFileSync(
    resolve(rootDir, 'src/pages/settings/SettingsPage.tsx'),
    'utf8',
  );
  const resultPageSource = readFileSync(
    resolve(rootDir, 'src/pages/tarot/TarotResultPage.tsx'),
    'utf8',
  );
  const routeSource = readFileSync(resolve(rootDir, 'src/router/routes.tsx'), 'utf8');
  const layoutSource = readFileSync(resolve(rootDir, 'src/app/layout/Layout.tsx'), 'utf8');
  const layoutCss = readFileSync(resolve(rootDir, 'src/app/layout/Layout.module.css'), 'utf8');
  const readingEngineSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/lib/reading-engine.ts'),
    'utf8',
  );
  const interpretationCopySource = readFileSync(
    resolve(rootDir, 'src/features/tarot/lib/interpretation-copy.ts'),
    'utf8',
  );
  const resultPresentationSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/lib/tarot-result-presentation.ts'),
    'utf8',
  );
  assertions.assert(
    cardViewSource.includes('visibleArtworkLayers?.map') &&
      cardViewSource.includes('data-artwork-provider') &&
      cardViewSource.includes('data-render-mode={artwork?.renderMode}'),
    {
      code: 'tarot-source-agnostic-layer-renderer',
      message: 'TarotCardView must render provider layers without branching on their source kind.',
    },
  );
  assertions.assert(existsSync(resolve(tarotAssetRoot, 'PREMIUM_ARTWORK_STYLE_GUIDE.md')), {
    code: 'tarot-premium-artwork-style-guide',
    message: 'The premium deck must ship with a preservation-focused production specification.',
  });
  assertions.assert(
    cardViewSource.indexOf('className={styles.orientationLabel}') >
      cardViewSource.indexOf('className={styles.tarotCardInner}'),
    {
      code: 'rws-upright-app-metadata',
      message: 'Orientation metadata must remain outside the rotating artwork/card layer.',
    },
  );
  const normalizationSource = readFileSync(
    resolve(rootDir, 'scripts/normalize-rws-artwork.mjs'),
    'utf8',
  );
  assertions.assert(
    normalizationSource.includes("'-map_metadata'") &&
      normalizationSource.includes('sourceTransform') &&
      normalizationSource.includes("'Exif\\0\\0'"),
    {
      code: 'rws-normalization-pipeline',
      message: 'Asset processing must apply the recorded source transform once and strip EXIF.',
    },
  );
  const cardBackSource = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/TarotCardBack.tsx'),
    'utf8',
  );
  const cardBackCss = readFileSync(
    resolve(rootDir, 'src/features/tarot/components/Tarot.module.css'),
    'utf8',
  );
  const mobileRevealCssStart = cardBackCss.lastIndexOf('@media (max-width: 47.99rem)');
  const mobileRevealCssEnd = cardBackCss.indexOf('@media (max-width: 27rem)', mobileRevealCssStart);
  const mobileRevealCss = cardBackCss.slice(mobileRevealCssStart, mobileRevealCssEnd);
  const cardInnerRule = cardBackCss.match(/\.tarotCardInner\s*\{(?<body>[^}]*)\}/u)?.groups?.body;
  const cardFacesRule = cardBackCss.match(/\.cardBackFace,\s*\.cardFrontFace\s*\{(?<body>[^}]*)\}/u)
    ?.groups?.body;
  assertions.assert(
    Boolean(cardInnerRule?.includes('-webkit-transform-style: preserve-3d')) &&
      Boolean(cardInnerRule?.includes('transform-style: preserve-3d')) &&
      !cardInnerRule?.includes('filter:') &&
      !cardInnerRule?.includes('isolation:'),
    {
      code: 'tarot-flip-preserve-3d-context',
      message:
        'The flip container must preserve its 3D faces without a grouping filter that flattens them.',
    },
  );
  assertions.assert(
    Boolean(cardFacesRule?.includes('-webkit-backface-visibility: hidden')) &&
      Boolean(cardFacesRule?.includes('backface-visibility: hidden')) &&
      cardBackCss.includes('.cardBackFace {\n  transform: rotateY(0deg);') &&
      cardBackCss.includes('.cardFrontFace {\n  transform: rotateY(180deg);') &&
      cardBackCss.includes("[data-visual-face='flipping'], [data-visual-face='front']") &&
      cardBackCss.includes(".tarotCardButton[data-visual-face='front'] .cardBackFace") &&
      cardBackCss.includes('display: none'),
    {
      code: 'tarot-flip-face-visibility-contract',
      message:
        'Hidden cards must show the zero-degree back and revealed cards must expose the opposite front face across WebKit and standard engines.',
    },
  );
  assertions.assert(
    cardViewSource.includes('src={layer.asset}') &&
      cardBackCss.includes('transform: rotate(var(--artwork-reading-rotation, 0deg))'),
    {
      code: 'tarot-flip-artwork-binding-and-orientation',
      message:
        'The visible front must bind the provider artwork while reading orientation remains isolated from the Y-axis flip.',
    },
  );
  const runtimeFaceCases = [
    { cardId: 'swords-six', orientation: 'upright' },
    { cardId: 'major-hermit', orientation: 'upright' },
    { cardId: 'major-moon', orientation: 'upright' },
    { cardId: 'major-sun', orientation: 'reversed' },
    { cardId: 'cups-three', orientation: 'upright' },
    { cardId: 'pentacles-ace', orientation: 'upright' },
  ] as const;
  runtimeFaceCases.forEach(({ cardId, orientation }) => {
    const artwork = getTarotArtwork(cardId);
    const markup = renderToStaticMarkup(
      createElement(TarotCardView, {
        isRevealed: true,
        locale: 'ru',
        revealStatus: 'revealed',
        selection: { cardId, orientation, positionId: 'runtime-face-check' },
        theme: 'cosmic-minimal',
        variant: 'revealing',
      }),
    );
    assertions.assert(
      resolveTarotCardVisualFace(true, 'revealed') === 'front' &&
        resolveTarotCardVisualFace(true, 'revealing') === 'flipping' &&
        resolveTarotCardVisualFace(false, 'ready') === 'back' &&
        markup.includes('data-visual-face="front"') &&
        markup.includes('data-front-mounted="true"') &&
        markup.includes(`data-card-id="${cardId}"`) &&
        markup.includes(`data-orientation="${orientation}"`) &&
        markup.includes('data-artwork-quality="premium"') &&
        artwork.layers.length > 0 &&
        artwork.layers.every((layer) => markup.includes(layer.asset)) &&
        markup.includes('<img'),
      {
        code: `tarot-revealed-runtime-face-${cardId}-${orientation}`,
        message: `${cardId} ${orientation} must render the resolved Premium front in an explicit final visual state.`,
      },
    );
  });
  (['cosmic-minimal', 'solar-lines', 'midnight-geometry', 'deep-water'] as const).forEach((theme) =>
    assertions.assert(
      cardBackSource.includes(`theme === '${theme}'`) &&
        cardBackCss.includes(`data-back-theme='${theme}'`),
      {
        code: `tarot-card-back-${theme}`,
        message: `${theme} must resolve to an original themed SVG back and CSS palette.`,
      },
    ),
  );
  assertions.assert(
    cardBackSource.includes('transform="rotate(180 70 120)"') && !cardBackSource.includes('<image'),
    {
      code: 'tarot-card-back-symmetry',
      message: 'Project card backs must remain vector-based and rotationally symmetric.',
    },
  );
  assertions.assert(
    cardViewSource.includes('<TarotCardBack theme={theme} />') &&
      !cardViewSource.includes('cardBackFrame') &&
      cardBackCss.includes('-webkit-backface-visibility: hidden') &&
      cardBackCss.includes('transform: rotateY(0deg)') &&
      cardBackCss.includes('transform: rotateY(180deg)') &&
      !cardBackCss.includes('translateZ(0.01px)') &&
      !cardBackCss.includes("[data-reveal-phase='flipping']::before") &&
      !cardBackCss.includes('@keyframes tarot-card-edge'),
    {
      code: 'tarot-card-back-shared-renderer',
      message:
        'Every face-down card must use the shared renderer, isolated 3D faces and no bright flip-edge overlay.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('data-reading-step={step}') &&
      readingFlowSource.includes('className={styles.revealFlow}') &&
      cardBackCss.includes('@media (min-width: 68.75rem)') &&
      cardBackCss.includes('min-block-size: 100svh') &&
      cardBackCss.includes('block-size: auto'),
    {
      code: 'tarot-reading-desktop-viewport-shell',
      message:
        'Desktop reveal must use a step-scoped, content-growing shell without constraining mobile.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('className={styles.revealTopBar}') &&
      readingFlowSource.includes('className={styles.revealContext}') &&
      readingFlowSource.includes('className={styles.revealTopProgress}') &&
      readingFlowSource.includes('className={styles.revealProgressDots}') &&
      readingFlowSource.includes('data-state={') &&
      cardBackCss.includes('inline-size: min(94%, 96rem)') &&
      cardBackCss.includes('--reading-gold: #c9a867') &&
      cardBackCss.includes('--reading-border: rgb(118 119 162 / 42%)'),
    {
      code: 'tarot-reading-approved-surface-hierarchy',
      message:
        'The approved reading surface must keep context, quiet progress and the wide dark-gold composition together.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('className={styles.revealDetails}') &&
      cardBackCss.includes("grid-template-areas: 'card details'") &&
      cardBackCss.includes('grid-area: details') &&
      cardBackCss.includes('align-items: center') &&
      cardBackCss.includes('align-content: start') &&
      cardBackCss.includes('grid-template-rows: auto') &&
      cardBackCss.includes('max-inline-size: 60ch') &&
      cardBackCss.includes('padding-block: var(--space-2)'),
    {
      code: 'tarot-reading-desktop-active-layout',
      message:
        'The desktop active card, interpretation, progress, and CTA must share one two-column stage.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('createActiveCardGuidance({') &&
      readingFlowSource.includes('{currentGuidance?.meaning}') &&
      readingFlowSource.includes('{currentGuidance?.action}') &&
      resultSource.includes('{heroPresentation.heroSummary}') &&
      resultSource.includes('heroPresentation.pattern.repeated') &&
      resultSource.includes('reading.interpretations.map'),
    {
      code: 'tarot-reading-position-aware-copy-binding',
      message:
        'Reveal and result views must render the position-aware card copy and synthesized reading.',
    },
  );
  assertions.assert(
    cardBackCss.includes('--tarot-card-width: clamp(17.5rem, 22vw, 20.5rem)') &&
      cardBackCss.includes('--tarot-card-ratio: 7 / 12') &&
      cardBackCss.includes('clamp(3.3rem, 4vw, 4.25rem)') &&
      cardBackCss.includes('inline-size: min(100%, 76rem)') &&
      cardBackCss.includes(
        'grid-template-columns: minmax(17.5rem, 0.42fr) minmax(35rem, 0.54fr)',
      ) &&
      cardBackCss.includes(".revealSequence[data-count='6']") &&
      cardBackCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))') &&
      cardBackCss.includes('text-wrap: balance') &&
      cardBackCss.includes('overflow-x: auto'),
    {
      code: 'tarot-reading-responsive-card-sizing',
      message:
        'The active card must retain its aspect ratio while the compact spread safely contains narrow widths.',
    },
  );
  assertions.assert(
    mobileRevealCssStart >= 0 &&
      mobileRevealCssEnd > mobileRevealCssStart &&
      mobileRevealCss.includes('--tarot-card-width: clamp(8.5rem, 38vw, 9.75rem)') &&
      mobileRevealCss.includes('--tarot-mobile-strip-card-width: clamp(2.9rem, 13vw, 3.5rem)') &&
      mobileRevealCss.includes('-webkit-line-clamp: 2') &&
      mobileRevealCss.includes('inline-size: 100%') &&
      mobileRevealCss.includes('margin-inline: 0') &&
      !mobileRevealCss.includes('margin-inline: calc(') &&
      !mobileRevealCss.includes('position: absolute') &&
      !mobileRevealCss.includes('inset-block-start: -'),
    {
      code: 'tarot-reading-mobile-reveal-bounds',
      message:
        'Mobile reveal cards must remain bounded in normal flow while the compact position strip keeps two-line labels.',
    },
  );
  assertions.assert(
    cardBackCss.includes('@media (min-width: 48rem) and (max-width: 68.749rem)') &&
      cardBackCss.includes('inline-size: min(96%, 72rem)') &&
      cardBackCss.includes('--tarot-card-width: clamp(15rem, 28vw, 17.5rem)') &&
      cardBackCss.includes('@media (min-width: 56rem) and (max-width: 68.749rem)') &&
      cardBackCss.includes('grid-template-columns: minmax(15rem, 0.4fr) minmax(24rem, 0.6fr)'),
    {
      code: 'tarot-reading-tablet-composition',
      message:
        'Tablet reveal must use the available reading width and promote the card above its mobile scale.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('useLayoutEffect') &&
      readingFlowSource.includes('const pendingRevealPositionRef = useRef<number | null>(null)') &&
      readingFlowSource.includes("const isMobileReveal = useMediaQuery('(max-width: 47.99rem)')") &&
      readingFlowSource.includes('const revealExperienceRef = useRef<HTMLDivElement>(null)') &&
      readingFlowSource.includes("step !== 'reveal' || !isMobileReveal") &&
      readingFlowSource.includes('pendingRevealPositionRef.current !== revealState.currentIndex') &&
      readingFlowSource.includes("revealState.card !== 'preparing'") &&
      readingFlowSource.includes("revealState.card !== 'settled'") &&
      readingFlowSource.includes("document.querySelector('header')") &&
      readingFlowSource.includes('revealExperience.getBoundingClientRect().top') &&
      readingFlowSource.includes("behavior: 'auto'") &&
      readingFlowSource.includes('revealTop - headerHeight - 16') &&
      readingFlowSource.includes('function requestRevealStartPosition(index: number)') &&
      readingFlowSource.includes('requestRevealStartPosition(revealState.currentIndex)') &&
      readingFlowSource.includes('requestRevealStartPosition(revealState.currentIndex + 1)') &&
      readingFlowSource.includes('data-reveal-scroll-anchor=""') &&
      readingFlowSource.includes('ref={revealExperienceRef}') &&
      readingFlowSource.includes('revealHeadingRef.current?.focus({ preventScroll: true })') &&
      !readingFlowSource.includes('function positionRevealBelowHeader()') &&
      (readingFlowSource.match(/window\.scrollTo/gu)?.length ?? 0) === 2 &&
      revealActionStart >= 0 &&
      revealActionEnd > revealActionStart &&
      !revealActionSource.includes('scrollTo') &&
      !revealActionSource.includes('scrollIntoView') &&
      !revealActionSource.includes('.focus(') &&
      mobileRevealCss.includes('overflow-anchor: none'),
    {
      code: 'tarot-reading-sticky-header-safe-position',
      message:
        'Mobile reveal must have one post-commit, sticky-header-safe scroll owner while focus and action handlers cannot move the viewport again.',
    },
  );
  assertions.assert(
    cardBackCss.includes(".flowPage[data-reading-step='reveal']") &&
      cardBackCss.includes('padding-block: clamp(1rem, 1.5vw, 1.5rem)') &&
      cardBackCss.includes('--tarot-card-ratio: 7 / 12') &&
      cardBackCss.includes('overflow-x: auto') &&
      !cardBackCss.includes('block-size: calc(100dvh - 6.75rem)') &&
      !/^\s*block-size:\s*100(?:d|s|lv)?vh;/mu.test(cardBackCss),
    {
      code: 'tarot-reading-responsive-flow-contract',
      message:
        'Reveal must preserve desktop breathing room, full artwork ratio, horizontal containment and content-growing height.',
    },
  );
  assertions.assert(
    cardBackCss.includes('--tarot-strip-card-width: clamp(3.3rem, 4vw, 4.25rem)') &&
      cardBackCss.includes('--tarot-strip-label-height: calc(var(--font-size-xs) * 2.6)') &&
      cardBackCss.includes('--tarot-strip-state-clearance: 0.625rem') &&
      cardBackCss.includes('padding: var(--space-3) var(--space-2) var(--space-5)') &&
      cardBackCss.includes('overflow: clip') &&
      cardBackCss.includes(".revealSequence[data-count='5'],") &&
      cardBackCss.includes(".revealSequence[data-count='6'] {") &&
      cardBackCss.includes('grid-template-columns: repeat(5, minmax(0, 1fr))') &&
      cardBackCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))') &&
      cardBackCss.includes('overflow-x: auto') &&
      cardBackCss.includes('scroll-snap-type: inline proximity'),
    {
      code: 'tarot-reading-top-strip-intrinsic-containment',
      message:
        'Desktop five- and six-card spread strips must reserve their tallest interactive state without vertical scrolling while preserving the mobile scroller.',
    },
  );
  assertions.assert(
    revealMarkupStart >= 0 &&
      revealMarkupEnd > revealMarkupStart &&
      revealMarkupSource.includes('className={styles.revealSequence}') &&
      revealMarkupSource.includes('data-count={selections.length}') &&
      revealMarkupSource.includes('{selections.map((selection, index) => {') &&
      !revealMarkupSource.includes('state.selectionMode') &&
      !/\.revealSequence\[data-count='5'\]\s+\.tarotCardButton[^{]*[{][^}]*grid-area:/s.test(
        cardBackCss,
      ),
    {
      code: 'tarot-reading-selection-mode-layout-convergence',
      message:
        'Manual and automatic readings must converge on one five/six-card reveal strip without legacy per-card placement.',
    },
  );
  assertions.assert(
    cardBackCss.includes(".flowPage[data-reading-step='reveal'] .flowHeader") &&
      cardBackCss.includes('display: none') &&
      readingFlowSource.includes('focus({ preventScroll: true })') &&
      readingFlowSource.includes("if (steps[nextStepIndex] === 'reveal') window.scrollTo(0, 0)") &&
      cardBackCss.includes('gap: clamp(var(--space-3), 1.6vw, var(--space-5))') &&
      cardBackCss.includes('padding: clamp(var(--space-5), 2vw, var(--space-7))') &&
      cardBackCss.includes(".flowSurface[data-reading-step='reveal'] .flowActions") &&
      cardBackCss.includes('min-block-size: 0') &&
      cardBackCss.includes('padding-block-start: var(--space-4)') &&
      cardBackCss.includes('margin-block-start: var(--space-2)') &&
      cardBackCss.includes('block-size: auto') &&
      !cardBackCss.includes('block-size: calc(100dvh - 6.75rem)') &&
      cardBackCss.includes('--tarot-strip-state-clearance: 0.625rem') &&
      cardBackCss.includes('overflow: clip'),
    {
      code: 'tarot-reading-combined-viewport-height-budget',
      message:
        'The desktop reading shell must preserve the compact top strip while allowing the reveal stage and CTA to grow without clipping.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('className={styles.revealCardTitle}') &&
      cardBackCss.includes(".revealCardTitle[data-variant='heading-md']") &&
      cardBackCss.includes('font-size: clamp(2.25rem, 3.3vw, 3.5rem)') &&
      cardBackCss.includes('font-family: var(--font-family-display)') &&
      cardBackCss.includes('border-radius: 0') &&
      cardBackCss.includes('background: none'),
    {
      code: 'tarot-reading-editorial-title-and-plain-position',
      message:
        'The active card needs the approved Prata title while progress and position metadata remain unboxed.',
    },
  );
  assertions.assert(
    resultSource.includes('className={styles.resultOpening}') &&
      resultSource.includes('variant="leading"') &&
      resultSource.includes('isRevealed') &&
      cardBackCss.includes('grid-template-columns: minmax(15rem, 0.38fr) minmax(0, 0.62fr)') &&
      cardBackCss.includes('min-block-size: calc(100dvh - 4rem)') &&
      cardBackCss.includes('--tarot-card-width: clamp(15rem, 18vw, 18rem)'),
    {
      code: 'tarot-result-desktop-viewport-hero',
      message:
        'The desktop result must keep its leading card and complete conclusion together in a viewport-aware two-column hero.',
    },
  );
  assertions.assert(
    cardBackCss.includes(".resultCopy h1[data-variant='display']") &&
      cardBackCss.includes('max-inline-size: min(100%, 18ch)') &&
      cardBackCss.includes('font-size: clamp(2rem, 4vw, 3.375rem)') &&
      readingEngineSource.includes('headline: synthesis.headline') &&
      interpretationCopySource.includes('headline: domainHeadlines.ru[domain]') &&
      resultSource.includes('heroPresentation.headline') &&
      resultSource.includes('className={styles.resultHeroTakeaway}') &&
      resultSource.includes('{reading.practicalFocus}') &&
      cardBackCss.includes('.resultSupportingLine') &&
      cardBackCss.includes('.resultHeroTakeaway'),
    {
      code: 'tarot-result-russian-headline-presentation',
      message:
        'Russian synthesis headlines must stay compact and wrap naturally at the editorial scale.',
    },
  );
  assertions.assert(
    resultSource.includes('useState<string | null>(null)') &&
      resultSource.includes('aria-label={`${isOpen ? copy.showLess : copy.showMore}:') &&
      resultSource.includes('aria-controls={detailId}') &&
      resultSource.includes('aria-expanded={isOpen}') &&
      resultSource.includes('aria-labelledby={triggerId}') &&
      resultSource.includes('role="region"') &&
      resultSource.includes('isOpen ? (') &&
      resultSource.includes('variant="history"'),
    {
      code: 'tarot-result-accessible-card-details',
      message:
        'Result details must default to collapsed, retain Premium thumbnails and expose accessible accordion state.',
    },
  );
  assertions.assert(
    resultSource.includes('className={styles.resultSecondaryContext}') &&
      resultSource.includes('{heroPresentation.secondaryContext}') &&
      resultPresentationSource.includes('.slice(0, 4)') &&
      cardBackCss.includes('.resultPatternGrid') &&
      cardBackCss.includes('.resultHeroTakeaway') &&
      cardBackCss.includes('.resultReflection') &&
      cardBackCss.includes('.resultDetails') &&
      cardBackCss.includes('grid-template-columns: 1fr'),
    {
      code: 'tarot-result-progressive-hierarchy',
      message:
        'Result takeaway, pattern, reflection, collapsible details and secondary numerology must remain hierarchically separated and mobile-safe.',
    },
  );
  assertions.assert(
    cardBackCss.includes(".flowSurface[data-reading-step='reveal']") &&
      cardBackCss.includes('box-sizing: border-box') &&
      cardBackCss.includes('overflow: hidden') &&
      cardBackCss.includes('min-block-size: 0') &&
      cardBackCss.includes('.revealDetails .revealInterpretation > p'),
    {
      code: 'tarot-reading-details-contained',
      message: 'Desktop reveal details and CTA must remain contained inside the viewport panel.',
    },
  );
  assertions.assert(
    readingPageSource.includes('journeyActions.recordReading(reading)') &&
      readingPageSource.includes('tarotSessionActions.saveReading(result.value)') &&
      readingPageSource.includes('if (!result.persisted)') &&
      readingPageSource.includes('navigate(ROUTES.tarotResult, { replace: true })') &&
      historyPageSource.includes('tarotSessionActions.saveReading(record.reading)') &&
      historyPageSource.includes('navigate(ROUTES.tarotResult)') &&
      !historyPageSource.includes('createTarotReading'),
    {
      code: 'tarot-history-reopens-snapshot',
      message:
        'Completed readings must save once and history detail must reuse the stored result without randomization.',
    },
  );
  assertions.assert(
    routeSource.includes('{ component: TarotHistoryPage, path: ROUTES.tarotHistory }') &&
      historySource.includes('variant="history"') &&
      historySource.includes('isRevealed') &&
      historySource.includes('actions.deleteReading') &&
      historySource.includes('actions.clearReadings') &&
      historySource.includes('records.length ? (') &&
      resultSource.includes('onOpenHistory') &&
      resultSource.includes('copy.savedReading'),
    {
      code: 'tarot-history-ui-contract',
      message:
        'Tarot history must provide Premium thumbnails, empty state, safe deletion, result reuse and result-page access.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('preferences.allowReversedCards') &&
      readingFlowSource.includes('!preferences.revealAnimations') &&
      readingFlowSource.includes('instantReveal={revealState.instant}') &&
      readingFlowSource.includes('reducedMotion: instantReveal'),
    {
      code: 'tarot-preferences-reading-behavior',
      message:
        'New-reading orientation and reveal timing must respect persistent Tarot preferences without changing the selection seed.',
    },
  );
  assertions.assert(
    tarotPreferencesSource.includes('type="checkbox"') &&
      tarotPreferencesSource.includes('<select') &&
      tarotPreferencesSource.includes('<output aria-label={copy.language}') &&
      tarotPreferencesSource.includes('<Modal') &&
      tarotPreferencesSource.includes('aria-live="polite"') &&
      settingsPageSource.includes('<TarotPreferencesSection') &&
      settingsPageSource.includes('journeyActions.setHistoryLimit(limit)') &&
      settingsPageSource.includes('if (!result.persisted)') &&
      settingsPageSource.includes('onBackToTarot={() => navigate(ROUTES.tarot)}'),
    {
      code: 'tarot-preferences-accessible-settings',
      message:
        'Tarot settings must reuse the existing Settings architecture with labelled native controls, status announcements and confirmed reset.',
    },
  );
  assertions.assert(
    tarotLandingSource.includes('onOpenHistory') &&
      tarotLandingSource.includes('onOpenSettings') &&
      resultSource.includes('onOpenHistory') &&
      resultSource.includes('onContinueJourney') &&
      resultSource.includes('onRestart') &&
      historySource.includes('onBack') &&
      historySource.includes('onCreate') &&
      tarotPreferencesSource.includes('onBackToTarot'),
    {
      code: 'tarot-production-navigation-continuity',
      message:
        'Landing, result, history, and settings must all expose an unambiguous next or return action.',
    },
  );
  assertions.assert(
    !tarotLandingSource.includes('futureQuestion') &&
      !resultSource.includes('tarotPackages') &&
      !resultSource.includes('boundaryGrid') &&
      !tarotCopySource.includes('публичный flow') &&
      !tarotCopySource.includes('Предварительный обзор'),
    {
      code: 'tarot-production-copy-and-preview-cleanup',
      message:
        'Completed Tarot surfaces must not expose implementation language or obsolete future-format previews.',
    },
  );
  assertions.assert(
    readingFlowSource.includes('previousStepIndexRef') &&
      readingFlowSource.includes("document.getElementById('tarot-reading-step-title')?.focus()") &&
      readingFlowSource.includes('revealHeadingRef.current?.focus({ preventScroll: true })') &&
      readingFlowSource.includes('id="tarot-reading-step-title"') &&
      readingFlowSource.includes('tabIndex={-1}'),
    {
      code: 'tarot-reading-step-focus-continuity',
      message:
        'Keyboard and screen-reader focus must follow in-page reading step changes without changing the reading state.',
    },
  );
  assertions.assert(
    historySource.includes('{copy.cancel}') &&
      historySource.includes('setAnnouncement(copy.cleared)') &&
      historySource.includes("document.getElementById('saved-readings-title')?.focus()") &&
      historySource.includes('tabIndex={-1}') &&
      historyCss.includes('content-visibility: auto') &&
      tarotPreferencesCss.includes('@media (forced-colors: active)') &&
      tarotPreferencesCss.includes('@media (prefers-reduced-motion: reduce)'),
    {
      code: 'tarot-history-settings-responsive-safety',
      message:
        'History and settings must retain localized feedback, scalable long-list rendering, forced colors, and reduced-motion support.',
    },
  );
  assertions.assert(
    resultPageSource.includes('copy.missingDescription') &&
      resultPageSource.includes('id="tarot-result-empty-title"') &&
      resultSource.includes('aria-label={copy.resultActionsLabel}') &&
      !resultSource.includes('className={styles.packages}'),
    {
      code: 'tarot-result-empty-and-completion-states',
      message:
        'The result route must offer a clear recovery state and end the completed analysis with real product actions.',
    },
  );
  assertions.assert(
    tarotLandingSource.includes('confirmNewReading && hasUnfinishedReading') &&
      tarotLandingSource.includes('newReadingDescription') &&
      tarotLandingSource.includes('onResume') &&
      tarotLandingSource.includes('copy.resumeReading') &&
      tarotSessionSource.includes('inProgress: true') &&
      tarotSessionSource.includes('inProgress: false') &&
      tarotSessionSource.includes("readBrowserStorage('sessionStorage', STATE_KEY)") &&
      tarotSessionSource.includes('saveRevealProgress(revealedCount: number)') &&
      readingFlowSource.includes('canResumeReveal ? steps.indexOf') &&
      readingFlowSource.includes('actions.saveRevealProgress(revealedCount)') &&
      journeyStoreSource.includes('currentHistoryLimit()') &&
      journeyStoreSource.includes('state.readings.length <= limit'),
    {
      code: 'tarot-preferences-history-and-reset-safety',
      message:
        'Unfinished readings must be resumable, safely persisted, optionally confirmed before replacement, and retention changes must only trim necessary oldest history records.',
    },
  );
  assertions.assert(
    layoutSource.includes('data-compact-sidebar={hasCompactSidebar || undefined}') &&
      layoutSource.includes('currentPath === ROUTES.tarotResult') &&
      layoutCss.includes(".body[data-compact-sidebar='true']") &&
      layoutCss.includes('grid-template-columns: 13rem minmax(0, 1fr)'),
    {
      code: 'tarot-result-compact-sidebar',
      message:
        'The result route must preserve desktop navigation while returning enough width to the conclusion hero.',
    },
  );

  return assertions.result({
    fixtureCount: rwsPublicDomainManifest.length,
    moduleVersions: { tarotArtwork: 'rws-classic-public-domain-v1' },
  });
}
