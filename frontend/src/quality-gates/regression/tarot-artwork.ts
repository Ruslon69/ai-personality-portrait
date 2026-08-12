import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

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
  const builtArtworkNames = new Set(
    builtArtworkFiles.map((path) => path.replace(/ \d+(?=\.jpg$)/u, '')),
  );
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
  assertions.assert(builtArtworkNames.size === QUALITY_BASELINE.tarotCardCount, {
    actual: builtArtworkNames.size,
    code: 'rws-built-file-coverage',
    expected: QUALITY_BASELINE.tarotCardCount,
    message: 'Vite must emit the 78 unique card faces as external image assets.',
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
    const artwork = getTarotArtwork(record.cardId, RWS_CLASSIC_DECK_ID);
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
      !cardViewSource.includes('cardBackFrame'),
    {
      code: 'tarot-card-back-shared-renderer',
      message: 'Every face-down card surface must use the shared original back renderer.',
    },
  );

  return assertions.result({
    fixtureCount: rwsPublicDomainManifest.length,
    moduleVersions: { tarotArtwork: 'rws-classic-public-domain-v1' },
  });
}
