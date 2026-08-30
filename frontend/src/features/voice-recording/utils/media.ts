import { voiceRecordingConfig } from '../config';
import { voiceRecordingCopy } from '../data';
import type { Locale } from '@shared/i18n';
import type { VoiceRecordingError, VoiceRecordingStatus } from '../types';

type MediaRecorderConstructor = typeof MediaRecorder;

export function isRecordingSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

export function getPreferredMimeType(Recorder: MediaRecorderConstructor = MediaRecorder) {
  if (typeof Recorder.isTypeSupported !== 'function') {
    return undefined;
  }

  return voiceRecordingConfig.mimeTypeCandidates.find((mimeType) =>
    Recorder.isTypeSupported(mimeType),
  );
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
}

export function revokeObjectUrl(url: string | null) {
  if (url && typeof URL !== 'undefined') {
    URL.revokeObjectURL(url);
  }
}

export function mapMediaError(
  error: unknown,
  locale: Locale = 'ru',
): {
  error: VoiceRecordingError;
  status: Extract<VoiceRecordingStatus, 'permission-denied' | 'unsupported' | 'error'>;
} {
  const copy = voiceRecordingCopy[locale];
  const errorName = error instanceof DOMException ? error.name : '';

  if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return {
      error: {
        code: 'unknown',
        message: copy.errors.permissionDenied,
      },
      status: 'permission-denied',
    };
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      error: {
        code: 'no-device',
        message: copy.errors.noDevice,
      },
      status: 'error',
    };
  }

  if (errorName === 'NotSupportedError') {
    return {
      error: {
        code: 'unsupported-format',
        message: copy.errors.unsupportedFormat,
      },
      status: 'unsupported',
    };
  }

  return {
    error: {
      code: 'unknown',
      message: copy.errors.genericPermission,
    },
    status: 'error',
  };
}
