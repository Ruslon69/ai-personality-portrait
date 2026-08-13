import { execFileSync } from 'node:child_process';

/**
 * Development-only contract for deterministic resizing today and an optional
 * super-resolution implementation in the future. Implementations must never
 * mutate their input and must report their technique honestly.
 *
 * @typedef {object} ArtworkUpscaleProvider
 * @property {string} id
 * @property {string} label
 * @property {'deterministic-resample'|'super-resolution'} kind
 * @property {boolean} isTrueSuperResolution
 * @property {(inputPath: string, outputPath: string, filterGraph: string) => void} process
 */

/** @type {ArtworkUpscaleProvider} */
export const localResampleProvider = Object.freeze({
  id: 'local-ffmpeg-lanczos-v1',
  label: 'FFmpeg Lanczos single-pass high-quality resampling',
  kind: 'deterministic-resample',
  isTrueSuperResolution: false,
  process(inputPath, outputPath, filterGraph) {
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-noautorotate',
        '-i',
        inputPath,
        '-vf',
        filterGraph,
        '-map_metadata',
        '-1',
        '-frames:v',
        '1',
        '-compression_level',
        '6',
        outputPath,
      ],
      { stdio: 'inherit' },
    );
  },
});

export const activeArtworkUpscaleProvider = localResampleProvider;
