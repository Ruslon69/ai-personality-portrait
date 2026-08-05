import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadReleaseConfig(rootDir) {
  return JSON.parse(readFileSync(resolve(rootDir, '.release/config.json'), 'utf8'));
}

export function validateReleaseConfig(config, rootDir) {
  const errors = [];
  const expectedStrings = [
    ['schemaVersion', 'release-config-v1'],
    ['projectId', 'ai-personality-portrait'],
    ['maturity', 'alpha'],
    ['protectedBranch', 'main'],
    ['requiredFrontendQualityCommand', 'npm run quality'],
  ];
  for (const [key, expected] of expectedStrings) {
    if (config[key] !== expected) errors.push(`${key} must equal ${expected}.`);
  }
  if (
    readFileSync(resolve(rootDir, config.nodeVersionFile ?? '.missing'), 'utf8').trim() !==
    '24.18.0'
  )
    errors.push('Node version source must pin 24.18.0 LTS.');
  if (
    readFileSync(resolve(rootDir, config.pythonVersionFile ?? '.missing'), 'utf8').trim() !== '3.11'
  )
    errors.push('Python version source must pin the supported 3.11 line.');
  if (JSON.stringify(config.supportedLocales) !== JSON.stringify(['ru', 'en', 'uk']))
    errors.push('supportedLocales must be ru, en, uk.');
  if (!Array.isArray(config.requiredBackendChecks) || config.requiredBackendChecks.length < 3)
    errors.push('requiredBackendChecks must contain lint, format, and health checks.');
  if (!Array.isArray(config.tagPatterns) || config.tagPatterns.length !== 5)
    errors.push('Exactly five approved tag patterns are required.');
  if (!config.artifactPolicy || config.artifactPolicy.personalDataAllowed !== false)
    errors.push('Artifact policy must explicitly reject personal data.');
  if (config.artifactPolicy?.sourceMapsAllowed !== false)
    errors.push('Release source maps must remain disabled.');
  const expectedVersions = {
    authorContent: 'author-content-v1',
    expertInterpretation: 'expert-interpretation-v1',
    journeyMemory: 'journey-memory-v1',
    numerologyCalculation: 'pythagorean-date-v1',
    productStorage: 'product-storage-v2',
    tarotRules: 'tarot-rules-v1',
  };
  if (JSON.stringify(config.requiredEngineVersions) !== JSON.stringify(expectedVersions))
    errors.push('Required engine versions differ from the quality baseline.');
  if (
    !Number.isInteger(config.bundleThresholds?.maximumInitialJavaScriptBytes) ||
    !Number.isInteger(config.bundleThresholds?.maximumJavaScriptAssetBytes)
  )
    errors.push('Bundle thresholds must be integer byte values.');
  if (
    config.bundleThresholds?.maximumInitialJavaScriptBytes !== 614400 ||
    config.bundleThresholds?.maximumJavaScriptAssetBytes !== 614400
  )
    errors.push('Bundle thresholds differ from the approved quality baseline.');
  for (const pattern of config.tagPatterns ?? []) {
    try {
      new RegExp(pattern);
    } catch {
      errors.push(`Invalid tag pattern: ${String(pattern)}`);
    }
  }
  return errors;
}

export function validateReleaseTag(tag, patterns) {
  if (typeof tag !== 'string' || tag.length === 0) return ['Release tag is required.'];
  if (tag.length > 80) return ['Release tag is too long.'];
  if (/\s/.test(tag)) return ['Release tag must not contain whitespace.'];
  if (!/^[A-Za-z0-9.-]+$/.test(tag)) return ['Release tag contains unsafe characters.'];
  if (!patterns.some((pattern) => new RegExp(pattern).test(tag)))
    return ['Release tag does not match an approved pattern.'];
  return [];
}
