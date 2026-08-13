import { execFileSync } from 'node:child_process';
import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir, rename, rm } from 'node:fs/promises';
import { basename, extname, isAbsolute, resolve, sep } from 'node:path';

import {
  assertRegularFile,
  frontendRoot,
  PRODUCTION_VERSIONS,
  readJson,
  sha256,
  writeJsonAtomic,
} from './lib.mjs';
import { activeArtworkUpscaleProvider } from './upscale-provider.mjs';

export const PREPARATION_VERSION = PRODUCTION_VERSIONS.preparation;
export const CANONICAL_TARGET = Object.freeze({ width: 1680, height: 2880 });
export const GOLDEN_MASTER_MINIMUM = Object.freeze({ width: 1400, height: 2400 });
export const TARGET_ASPECT_RATIO = 7 / 12;
export const MAX_CROP_FRACTION = 0.04;
const MAX_SOURCE_BYTES = 100 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const SRGB_PROFILE = '/System/Library/ColorSync/Profiles/sRGB Profile.icc';

function roundEven(value) {
  return Math.max(2, Math.floor(value / 2) * 2);
}

function probeImage(path) {
  let output;
  try {
    output = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height,pix_fmt,color_space,color_transfer,color_primaries:stream_tags=rotate:stream_side_data=rotation',
        '-of',
        'json',
        path,
      ],
      { encoding: 'utf8' },
    );
  } catch {
    throw new Error('Source is not a readable PNG or JPEG image.');
  }
  const stream = JSON.parse(output).streams?.[0];
  if (!Number.isInteger(stream?.width) || !Number.isInteger(stream?.height)) {
    throw new Error('Source does not contain a valid image stream.');
  }
  let rotation = Number(stream.tags?.rotate ?? stream.side_data_list?.[0]?.rotation ?? 0);
  if (rotation === 0 && existsSync('/usr/bin/sips')) {
    try {
      const orientationOutput = execFileSync('/usr/bin/sips', ['-g', 'orientation', path], {
        encoding: 'utf8',
      });
      const exifOrientation = Number(orientationOutput.match(/orientation:\s*(\d+)/u)?.[1] ?? 1);
      const exifRotation = { 1: 0, 3: 180, 6: 270, 8: 90 }[exifOrientation];
      if (exifRotation === undefined) {
        throw new Error(`Mirrored EXIF orientation ${exifOrientation} is not supported.`);
      }
      rotation = exifRotation;
    } catch (error) {
      if (error.message?.startsWith('Mirrored EXIF orientation')) throw error;
    }
  }
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  if (![0, 90, 180, 270].includes(normalizedRotation)) {
    throw new Error(`Image orientation ${rotation}° could not be normalized safely.`);
  }
  const swapsAxes = normalizedRotation === 90 || normalizedRotation === 270;
  return {
    width: stream.width,
    height: stream.height,
    effectiveWidth: swapsAxes ? stream.height : stream.width,
    effectiveHeight: swapsAxes ? stream.width : stream.height,
    rotation: normalizedRotation,
    pixelFormat: stream.pix_fmt ?? 'unknown',
    colorProfile:
      [stream.color_primaries, stream.color_transfer, stream.color_space]
        .filter(Boolean)
        .join(' / ') || 'not embedded',
  };
}

export async function inspectArtwork(sourcePath) {
  if (!isAbsolute(sourcePath)) throw new Error('Source path must be absolute.');
  const extension = extname(sourcePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported source type ${extension || '(none)'}; use PNG or JPEG.`);
  }
  let details;
  try {
    details = await assertRegularFile(sourcePath);
  } catch {
    throw new Error(`Source file does not exist or is not a regular file: ${sourcePath}`);
  }
  if (details.size <= 0 || details.size > MAX_SOURCE_BYTES) {
    throw new Error('Source must be non-empty and no larger than 100 MB.');
  }
  const probe = probeImage(sourcePath);
  if (probe.effectiveHeight <= probe.effectiveWidth) {
    throw new Error('Source must resolve to a portrait image after orientation normalization.');
  }
  return { ...probe, details, extension, checksum: await sha256(sourcePath) };
}

export function planArtworkPreparation(inspection, { sharpen = false } = {}) {
  const { effectiveWidth: width, effectiveHeight: height } = inspection;
  const sourceRatio = width / height;
  let cropWidth = width;
  let cropHeight = height;
  if (sourceRatio > TARGET_ASPECT_RATIO) cropWidth = roundEven(height * TARGET_ASPECT_RATIO);
  if (sourceRatio < TARGET_ASPECT_RATIO) cropHeight = roundEven(width / TARGET_ASPECT_RATIO);
  const cropFraction = Math.max((width - cropWidth) / width, (height - cropHeight) / height, 0);
  if (cropFraction > MAX_CROP_FRACTION) {
    throw new Error(
      `Source ratio ${sourceRatio.toFixed(4)} is outside allowed 7:12 tolerance; safe centered crop would remove ${(cropFraction * 100).toFixed(2)}%.`,
    );
  }
  const cropX = Math.max(0, Math.floor((width - cropWidth) / 2));
  const cropY = Math.max(0, Math.floor((height - cropHeight) / 2));
  const resizeApplied =
    cropWidth < GOLDEN_MASTER_MINIMUM.width || cropHeight < GOLDEN_MASTER_MINIMUM.height;
  const preparedWidth = resizeApplied ? CANONICAL_TARGET.width : cropWidth;
  const preparedHeight = resizeApplied ? CANONICAL_TARGET.height : cropHeight;
  const nativeResolutionEligible =
    cropWidth >= GOLDEN_MASTER_MINIMUM.width && cropHeight >= GOLDEN_MASTER_MINIMUM.height;
  return {
    cropApplied: cropWidth !== width || cropHeight !== height,
    cropBox: { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
    cropFraction: Number(cropFraction.toFixed(6)),
    resizeApplied,
    preparedWidth,
    preparedHeight,
    resizeScale: resizeApplied
      ? Number(Math.max(preparedWidth / cropWidth, preparedHeight / cropHeight).toFixed(6))
      : 1,
    sharpenApplied: sharpen,
    nativeResolutionEligible,
    preparedResolutionEligible:
      preparedWidth >= GOLDEN_MASTER_MINIMUM.width &&
      preparedHeight >= GOLDEN_MASTER_MINIMUM.height,
  };
}

function orientationTransform(rotation) {
  if (rotation === 90) return 'rotate-90-ccw';
  if (rotation === 180) return 'rotate-180';
  if (rotation === 270) return 'rotate-90-cw';
  return 'none';
}

function buildFilterGraph(plan, rotation) {
  const filters = [];
  if (rotation === 90) filters.push('transpose=cclock');
  if (rotation === 180) filters.push('hflip', 'vflip');
  if (rotation === 270) filters.push('transpose=clock');
  if (plan.cropApplied) {
    const { width, height, x, y } = plan.cropBox;
    filters.push(`crop=${width}:${height}:${x}:${y}`);
  }
  if (plan.resizeApplied) {
    filters.push(
      `scale=${CANONICAL_TARGET.width}:${CANONICAL_TARGET.height}:flags=lanczos:force_original_aspect_ratio=increase`,
      `crop=${CANONICAL_TARGET.width}:${CANONICAL_TARGET.height}`,
    );
  }
  if (plan.sharpenApplied) filters.push('unsharp=3:3:0.25:3:3:0');
  if (!filters.length) filters.push('null');
  return filters.join(',');
}

function safeCardId(cardId) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cardId)) {
    throw new Error(`Invalid card ID: ${cardId}`);
  }
  return cardId;
}

export async function validatePreparationReport(report, { sourcePath, preparedPath } = {}) {
  if (report.pipelineVersion !== PREPARATION_VERSION) {
    throw new Error('Preparation report uses an unsupported pipeline version.');
  }
  if (!report.sourceModifiedAt || Number.isNaN(Date.parse(report.sourceModifiedAt))) {
    throw new Error('Preparation report is missing source generation provenance.');
  }
  const resolvedSource = sourcePath ?? report.sourcePath;
  const resolvedPrepared = preparedPath ?? report.preparedPath;
  if (!isAbsolute(resolvedSource) || !isAbsolute(resolvedPrepared)) {
    throw new Error('Preparation provenance paths must be absolute tooling paths.');
  }
  if ((await sha256(resolvedSource)) !== report.sourceChecksum) {
    throw new Error('Original source checksum no longer matches its preparation report.');
  }
  if ((await sha256(resolvedPrepared)) !== report.preparedChecksum) {
    throw new Error('Prepared asset checksum no longer matches its preparation report.');
  }
  const prepared = probeImage(resolvedPrepared);
  if (
    prepared.width !== report.preparedWidth ||
    prepared.height !== report.preparedHeight ||
    prepared.rotation !== 0
  ) {
    throw new Error('Prepared asset dimensions or physical orientation do not match the report.');
  }
  if (
    prepared.width < GOLDEN_MASTER_MINIMUM.width ||
    prepared.height < GOLDEN_MASTER_MINIMUM.height
  ) {
    throw new Error('Prepared output failed minimum dimensions.');
  }
  if (Math.abs(prepared.width / prepared.height - TARGET_ASPECT_RATIO) > 0.002) {
    throw new Error('Prepared output is not compatible with the canonical 7:12 viewport.');
  }
  return report;
}

export async function prepareArtwork(
  sourcePath,
  { cardId = 'major-fool', outputRoot, sharpen = false } = {},
) {
  const normalizedCardId = safeCardId(cardId);
  const inspection = await inspectArtwork(sourcePath);
  const plan = planArtworkPreparation(inspection, { sharpen });
  const preparedRoot = outputRoot
    ? resolve(outputRoot, normalizedCardId)
    : resolve(frontendRoot, 'premium-production/prepared', normalizedCardId);
  const stableBase = `${normalizedCardId}-${inspection.checksum.slice(0, 16)}-${PREPARATION_VERSION}${sharpen ? '-sharpened' : ''}`;
  const preparedPath = resolve(preparedRoot, `${stableBase}.png`);
  const reportPath = resolve(preparedRoot, `${stableBase}.json`);
  const allowedPrefix = `${preparedRoot}${sep}`;
  if (!preparedPath.startsWith(allowedPrefix) || !reportPath.startsWith(allowedPrefix)) {
    throw new Error('Prepared destination escaped its dedicated tooling directory.');
  }
  await mkdir(preparedRoot, { recursive: true });

  if (existsSync(preparedPath) && existsSync(reportPath)) {
    const cached = await readJson(reportPath);
    if (
      cached.sourceChecksum === inspection.checksum &&
      cached.pipelineVersion === PREPARATION_VERSION &&
      cached.sharpenApplied === sharpen
    ) {
      await validatePreparationReport(cached, { sourcePath, preparedPath });
      return { inspection, plan, report: cached, reportPath, reused: true };
    }
  }

  const rasterPath = resolve(preparedRoot, `${stableBase}.raster.png`);
  const profilePath = resolve(preparedRoot, `${stableBase}.profile.png`);
  await Promise.all([rm(rasterPath, { force: true }), rm(profilePath, { force: true })]);
  try {
    activeArtworkUpscaleProvider.process(
      sourcePath,
      rasterPath,
      buildFilterGraph(plan, inspection.rotation),
    );
    if (existsSync(SRGB_PROFILE)) {
      await copyFile(rasterPath, profilePath, constants.COPYFILE_EXCL);
      execFileSync('/usr/bin/sips', ['-s', 'format', 'png', '-m', SRGB_PROFILE, profilePath], {
        stdio: 'ignore',
      });
      await rename(profilePath, preparedPath);
    } else {
      await rename(rasterPath, preparedPath);
    }
    const preparedProbe = probeImage(preparedPath);
    const preparedChecksum = await sha256(preparedPath);
    const report = {
      cardId: normalizedCardId,
      sourcePath,
      preparedPath,
      sourceFileName: basename(sourcePath),
      sourceChecksum: inspection.checksum,
      sourceModifiedAt: inspection.details.mtime.toISOString(),
      preparedChecksum,
      sourceWidth: inspection.width,
      sourceHeight: inspection.height,
      sourceEffectiveWidth: inspection.effectiveWidth,
      sourceEffectiveHeight: inspection.effectiveHeight,
      preparedWidth: preparedProbe.width,
      preparedHeight: preparedProbe.height,
      sourceAspectRatio: Number(
        (inspection.effectiveWidth / inspection.effectiveHeight).toFixed(6),
      ),
      preparedAspectRatio: Number((preparedProbe.width / preparedProbe.height).toFixed(6)),
      orientationTransform: orientationTransform(inspection.rotation),
      cropApplied: plan.cropApplied,
      cropBox: plan.cropApplied ? plan.cropBox : undefined,
      resizeApplied: plan.resizeApplied,
      resizeMethod: plan.resizeApplied
        ? activeArtworkUpscaleProvider.label
        : 'none; original pixel dimensions preserved',
      resizeProviderId: activeArtworkUpscaleProvider.id,
      resizeProviderKind: activeArtworkUpscaleProvider.kind,
      trueSuperResolution: activeArtworkUpscaleProvider.isTrueSuperResolution,
      resizeScale: plan.resizeScale,
      sharpenApplied: plan.sharpenApplied,
      sharpenMethod: plan.sharpenApplied ? 'FFmpeg unsharp 3×3 amount 0.25, one pass' : 'none',
      colorProfileBefore: inspection.colorProfile,
      colorProfileAfter: existsSync(SRGB_PROFILE)
        ? 'sRGB IEC61966-2.1 (ColorSync)'
        : 'not embedded',
      colorProfileTransformation: existsSync(SRGB_PROFILE)
        ? 'ColorSync profile conversion to sRGB IEC61966-2.1'
        : 'no safe local profile conversion available',
      metadataRemoved: [
        'EXIF orientation',
        'GPS',
        'generator metadata',
        'comments',
        'private paths',
      ],
      nativeResolutionEligible: plan.nativeResolutionEligible,
      preparedResolutionEligible: plan.preparedResolutionEligible,
      createdAt: new Date().toISOString(),
      pipelineVersion: PREPARATION_VERSION,
    };
    await writeJsonAtomic(reportPath, report);
    await validatePreparationReport(report, { sourcePath, preparedPath });
    return { inspection, plan, report, reportPath, reused: false };
  } finally {
    await Promise.all([rm(rasterPath, { force: true }), rm(profilePath, { force: true })]);
  }
}

export function formatPreparationSummary({ report, reportPath, reused }) {
  const crop = report.cropApplied
    ? `${report.cropBox.width}×${report.cropBox.height} at ${report.cropBox.x},${report.cropBox.y}`
    : 'none';
  return [
    `Preparation ${reused ? 'reused deterministic output' : 'complete'}:`,
    `Source: ${report.sourceWidth}×${report.sourceHeight} (${report.colorProfileBefore})`,
    `Orientation: ${report.orientationTransform}`,
    `Crop: ${crop}`,
    `Resize: ${report.resizeApplied ? `${report.resizeMethod}; ${report.resizeScale}×` : 'not required'}`,
    `Sharpen: ${report.sharpenMethod}`,
    `Color: ${report.colorProfileTransformation}`,
    `Prepared: ${report.preparedWidth}×${report.preparedHeight}`,
    `Eligibility: ${report.nativeResolutionEligible ? 'nativeResolutionEligible' : 'preparedResolutionEligible'}`,
    `Prepared file: ${report.preparedPath}`,
    `Report: ${reportPath}`,
  ].join('\n');
}
