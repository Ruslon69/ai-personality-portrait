import { voiceRecordingConfig } from '../config';
import type { AudioQualityInput, VoiceQualityResult, VoiceRecordingIssue } from '../types';

const supportedMimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4'];

const issueMessages: Record<VoiceRecordingIssue, string> = {
  empty: 'В записи не обнаружены аудиоданные. Проверьте микрофон и попробуйте ещё раз.',
  'low-signal': 'Сигнал получился слишком тихим. Попробуйте говорить немного ближе к микрофону.',
  'too-long': 'Запись превысила максимальную длительность. Прочитайте текст ещё раз без спешки.',
  'too-short': 'Запись получилась слишком короткой. Прочитайте подготовленный текст полностью.',
  'unsupported-format':
    'Браузер создал неподдерживаемый аудиоформат. Можно попробовать другой браузер или пропустить голос.',
};

export function isSupportedAudioMimeType(mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase();
  return supportedMimeTypes.some((supportedType) => normalizedMimeType.startsWith(supportedType));
}

export function validateAudioQuality({
  averageSignalLevel,
  blobSize,
  durationMs,
  mimeType,
  signalSampleCount,
}: AudioQualityInput): VoiceQualityResult {
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
    message: firstIssue
      ? issueMessages[firstIssue]
      : 'Техническое качество записи подходит для следующего шага.',
    valid: issues.length === 0,
  };
}
