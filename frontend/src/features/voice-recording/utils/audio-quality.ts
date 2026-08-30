import { voiceRecordingConfig } from '../config';
import { voiceRecordingCopy } from '../data';
import type { Locale } from '@shared/i18n';
import type { AudioQualityInput, VoiceQualityResult, VoiceRecordingIssue } from '../types';

const supportedMimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4'];

export function isSupportedAudioMimeType(mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase();
  return supportedMimeTypes.some((supportedType) => normalizedMimeType.startsWith(supportedType));
}

export function validateAudioQuality(
  { averageSignalLevel, blobSize, durationMs, mimeType, signalSampleCount }: AudioQualityInput,
  locale: Locale = 'ru',
): VoiceQualityResult {
  const copy = voiceRecordingCopy[locale];
  const issues: VoiceRecordingIssue[] = [];

  if (blobSize === 0) {
    issues.push('empty');
  }

  if (!isSupportedAudioMimeType(mimeType)) {
    issues.push('unsupported-format');
  }

  if (durationMs < voiceRecordingConfig.minDurationMs) {
    issues.push('too-short');
  }

  if (durationMs > voiceRecordingConfig.maxDurationMs) {
    issues.push('too-long');
  }

  if (
    averageSignalLevel !== null &&
    signalSampleCount >= voiceRecordingConfig.minSignalSamples &&
    averageSignalLevel < voiceRecordingConfig.lowSignalThreshold
  ) {
    issues.push('low-signal');
  }

  const firstIssue = issues[0];

  return {
    issues,
    message: firstIssue ? copy.issueMessages[firstIssue] : copy.qualitySuccess,
    valid: issues.length === 0,
  };
}
