import { voiceRecordingConfig } from '../config';
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

export function mapMediaError(error: unknown): {
  error: VoiceRecordingError;
  status: Extract<VoiceRecordingStatus, 'permission-denied' | 'unsupported' | 'error'>;
} {
  const errorName = error instanceof DOMException ? error.name : '';

  if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return {
      error: {
        code: 'unknown',
        message:
          'Доступ к микрофону не предоставлен. Его можно разрешить в настройках браузера или продолжить без голоса.',
      },
      status: 'permission-denied',
    };
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      error: {
        code: 'no-device',
        message:
          'Микрофон не найден. Проверьте подключение устройства или продолжите без голосового шага.',
      },
      status: 'error',
    };
  }

  if (errorName === 'NotSupportedError') {
    return {
      error: {
        code: 'unsupported-format',
        message:
          'Браузер не смог начать запись в поддерживаемом формате. Можно попробовать другой браузер или пропустить голос.',
      },
      status: 'unsupported',
    };
  }

  return {
    error: {
      code: 'unknown',
      message:
        'Не удалось подготовить микрофон. Попробуйте ещё раз или продолжите без голосового шага.',
    },
    status: 'error',
  };
}
