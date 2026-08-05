import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { loadReleaseConfig, validateReleaseConfig, validateReleaseTag } from './lib/release.mjs';

const rootDir = resolve(import.meta.dirname, '..');
const [command = 'validate', ...args] = process.argv.slice(2);
const config = loadReleaseConfig(rootDir);

function fail(errors) {
  for (const error of errors) process.stderr.write(`release-metadata: ${error}\n`);
  process.exitCode = 1;
}

if (command === 'validate') {
  const errors = validateReleaseConfig(config, rootDir);
  if (errors.length) fail(errors);
  else process.stdout.write('Release metadata is valid.\n');
} else if (command === 'validate-tag') {
  const errors = validateReleaseTag(args[0] ?? '', config.tagPatterns);
  if (errors.length) fail(errors);
  else process.stdout.write(`Release tag is valid: ${args[0]}\n`);
} else if (command === 'summary') {
  const tag = args.find((argument) => argument.startsWith('--tag='))?.slice(6) ?? null;
  const output = args.find((argument) => argument.startsWith('--output='))?.slice(9);
  const errors = [
    ...validateReleaseConfig(config, rootDir),
    ...(tag ? validateReleaseTag(tag, config.tagPatterns) : []),
  ];
  if (errors.length) fail(errors);
  else {
    const summary = {
      artifactPolicy: config.artifactPolicy,
      buildDirectories: config.expectedBuildDirectories,
      configChecksum: createHash('sha256').update(JSON.stringify(config)).digest('hex'),
      engineVersions: config.requiredEngineVersions,
      maturity: config.maturity,
      projectId: config.projectId,
      qualityCommand: config.requiredFrontendQualityCommand,
      schemaVersion: config.schemaVersion,
      tag,
    };
    const json = `${JSON.stringify(summary, null, 2)}\n`;
    if (output) {
      const path = resolve(rootDir, output);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, json, 'utf8');
      process.stdout.write(`Release metadata summary: ${path}\n`);
    } else process.stdout.write(json);
  }
} else fail([`Unknown command: ${command}`]);
