export type VoiceRecordingStatus =
  | 'idle'
  | 'requesting-permission'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'permission-denied'
  | 'unsupported'
  | 'error';

export type VoiceRecordingErrorCode =
  'no-device' | 'device-lost' | 'recorder-error' | 'unsupported-format' | 'unknown';

export type VoiceRecordingIssue =
  'too-short' | 'too-long' | 'empty' | 'low-signal' | 'unsupported-format';

export type VoiceRecordingError = {
  code: VoiceRecordingErrorCode;
  message: string;
};

export type LocalAudioRecording = {
  averageSignalLevel: number | null;
  blob: Blob;
  durationMs: number;
  mimeType: string;
  signalSampleCount: number;
  url: string;
};

export type VoiceQualityResult = {
  issues: VoiceRecordingIssue[];
  message: string;
  valid: boolean;
};

export type AudioQualityInput = {
  averageSignalLevel: number | null;
  blobSize: number;
  durationMs: number;
  mimeType: string;
  signalSampleCount: number;
};
