import { useCallback, useEffect, useRef, useState } from 'react';

import type { Locale } from '@shared/i18n';

import { voiceRecordingConfig } from '../config';
import { voiceRecordingCopy } from '../data';
import type {
  LocalAudioRecording,
  VoiceQualityResult,
  VoiceRecordingError,
  VoiceRecordingStatus,
} from '../types';
import {
  getPreferredMimeType,
  isRecordingSupported,
  mapMediaError,
  revokeObjectUrl,
  stopMediaStream,
  validateAudioQuality,
} from '../utils';

const audioConstraints: MediaStreamConstraints = {
  audio: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
  },
  video: false,
};

export function useVoiceRecording(locale: Locale = 'ru') {
  const copy = voiceRecordingCopy[locale];
  const [status, setStatus] = useState<VoiceRecordingStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number | null>(null);
  const [recording, setRecording] = useState<LocalAudioRecording | null>(null);
  const [quality, setQuality] = useState<VoiceQualityResult | null>(null);
  const [error, setError] = useState<VoiceRecordingError | null>(null);

  const mountedRef = useRef(true);
  const statusRef = useRef<VoiceRecordingStatus>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const finalDurationRef = useRef(0);
  const stoppedByLimitRef = useRef(false);
  const ignoreRecorderStopRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const elapsedIntervalRef = useRef<number | null>(null);
  const maxDurationTimeoutRef = useRef<number | null>(null);
  const levelIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const signalSumRef = useRef(0);
  const signalSampleCountRef = useRef(0);

  const updateStatus = useCallback((nextStatus: VoiceRecordingStatus) => {
    statusRef.current = nextStatus;
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (elapsedIntervalRef.current !== null) {
      window.clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }

    if (maxDurationTimeoutRef.current !== null) {
      window.clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
  }, []);

  const stopLevelMonitoring = useCallback(() => {
    if (levelIntervalRef.current !== null) {
      window.clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = null;
    }

    audioSourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioSourceRef.current = null;
    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    if (mountedRef.current) {
      setAudioLevel(null);
    }
  }, []);

  const releaseStream = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const clearRecording = useCallback(() => {
    revokeObjectUrl(objectUrlRef.current);
    objectUrlRef.current = null;

    if (mountedRef.current) {
      setRecording(null);
      setQuality(null);
      setElapsedMs(0);
    }
  }, []);

  const abortActiveCapture = useCallback(
    (nextError?: VoiceRecordingError) => {
      ignoreRecorderStopRef.current = true;
      const recorder = recorderRef.current;

      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onerror = null;
        recorder.onstop = null;

        if (recorder.state !== 'inactive') {
          try {
            recorder.stop();
          } catch {
            // Resources are released below even if the recorder cannot stop cleanly.
          }
        }
      }

      recorderRef.current = null;
      clearTimers();
      stopLevelMonitoring();
      releaseStream();

      if (nextError && mountedRef.current) {
        setError(nextError);
        updateStatus('error');
      }
    },
    [clearTimers, releaseStream, stopLevelMonitoring, updateStatus],
  );

  const handleFailure = useCallback(
    (failure: unknown) => {
      abortActiveCapture();
      const mappedError = mapMediaError(failure, locale);

      if (mountedRef.current) {
        setError(mappedError.error);
        updateStatus(mappedError.status);
      }
    },
    [abortActiveCapture, locale, updateStatus],
  );

  const startLevelMonitoring = useCallback(
    (stream: MediaStream) => {
      if (typeof window.AudioContext === 'undefined') {
        setAudioLevel(null);
        return;
      }

      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        const samples = new Float32Array(analyser.fftSize);
        source.connect(analyser);
        audioContextRef.current = audioContext;
        audioSourceRef.current = source;
        analyserRef.current = analyser;
        setAudioLevel(null);
        void audioContext.resume().catch(() => undefined);

        levelIntervalRef.current = window.setInterval(() => {
          if (audioContext.state !== 'running') {
            return;
          }

          analyser.getFloatTimeDomainData(samples);
          const squareSum = samples.reduce((sum, sample) => sum + sample * sample, 0);
          const rms = Math.sqrt(squareSum / samples.length);

          signalSumRef.current += rms;
          signalSampleCountRef.current += 1;

          if (mountedRef.current) {
            setAudioLevel(Math.min(1, rms * 8));
          }
        }, voiceRecordingConfig.levelSampleIntervalMs);
      } catch {
        stopLevelMonitoring();
      }
    },
    [stopLevelMonitoring],
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;

    if (!recorder || recorder.state === 'inactive') {
      return;
    }

    finalDurationRef.current = stoppedByLimitRef.current
      ? voiceRecordingConfig.maxDurationMs
      : Math.min(Date.now() - startTimeRef.current, voiceRecordingConfig.maxDurationMs);

    if (mountedRef.current) {
      setElapsedMs(finalDurationRef.current);
    }

    clearTimers();
    stopLevelMonitoring();

    try {
      recorder.stop();
    } catch {
      abortActiveCapture({
        code: 'recorder-error',
        message: copy.errors.stop,
      });
    } finally {
      releaseStream();
    }
  }, [abortActiveCapture, clearTimers, copy.errors.stop, releaseStream, stopLevelMonitoring]);

  const requestPermission = useCallback(async () => {
    if (!isRecordingSupported()) {
      setError({
        code: 'unsupported-format',
        message: copy.errors.unsupported,
      });
      updateStatus('unsupported');
      return;
    }

    setError(null);
    updateStatus('requesting-permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);

      if (!mountedRef.current) {
        stopMediaStream(stream);
        return;
      }

      if (stream.getAudioTracks().length === 0) {
        stopMediaStream(stream);
        throw new DOMException('Audio input is unavailable', 'NotFoundError');
      }

      stopMediaStream(stream);
      updateStatus('ready');
    } catch (failure) {
      handleFailure(failure);
    }
  }, [copy.errors.unsupported, handleFailure, updateStatus]);

  const startRecording = useCallback(async () => {
    if (!isRecordingSupported()) {
      setError({
        code: 'unsupported-format',
        message: copy.errors.unsupported,
      });
      updateStatus('unsupported');
      return;
    }

    clearRecording();
    setError(null);
    updateStatus('requesting-permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);

      if (!mountedRef.current) {
        stopMediaStream(stream);
        return;
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stopMediaStream(stream);
        throw new DOMException('Audio input is unavailable', 'NotFoundError');
      }

      streamRef.current = stream;
      const preferredMimeType = getPreferredMimeType();
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      chunksRef.current = [];
      signalSumRef.current = 0;
      signalSampleCountRef.current = 0;
      stoppedByLimitRef.current = false;
      ignoreRecorderStopRef.current = false;

      const handleDeviceLost = () => {
        if (statusRef.current !== 'recording') {
          return;
        }

        abortActiveCapture({
          code: 'device-lost',
          message: copy.errors.deviceLost,
        });
      };

      audioTracks.forEach((track) => {
        track.onended = handleDeviceLost;
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        abortActiveCapture({
          code: 'recorder-error',
          message: copy.errors.recorder,
        });
      };

      recorder.onstop = () => {
        recorderRef.current = null;

        if (ignoreRecorderStopRef.current || !mountedRef.current) {
          ignoreRecorderStopRef.current = false;
          return;
        }

        const mimeType = recorder.mimeType || chunksRef.current[0]?.type || '';
        const blob = new Blob(chunksRef.current, { type: mimeType });

        try {
          const url = URL.createObjectURL(blob);
          revokeObjectUrl(objectUrlRef.current);
          objectUrlRef.current = url;

          const sampleCount = signalSampleCountRef.current;
          const averageSignalLevel = sampleCount > 0 ? signalSumRef.current / sampleCount : null;

          setRecording({
            averageSignalLevel,
            blob,
            durationMs: finalDurationRef.current,
            mimeType,
            signalSampleCount: sampleCount,
            url,
          });
          updateStatus('recorded');
        } catch {
          setError({
            code: 'recorder-error',
            message: copy.errors.preparePlayback,
          });
          updateStatus('error');
        }
      };

      startTimeRef.current = Date.now();
      finalDurationRef.current = 0;
      setElapsedMs(0);
      startLevelMonitoring(stream);
      recorder.start(voiceRecordingConfig.recorderTimesliceMs);
      updateStatus('recording');

      elapsedIntervalRef.current = window.setInterval(() => {
        if (mountedRef.current) {
          setElapsedMs(
            Math.min(Date.now() - startTimeRef.current, voiceRecordingConfig.maxDurationMs),
          );
        }
      }, voiceRecordingConfig.elapsedUpdateIntervalMs);

      maxDurationTimeoutRef.current = window.setTimeout(() => {
        stoppedByLimitRef.current = true;
        stopRecording();
      }, voiceRecordingConfig.maxDurationMs);
    } catch (failure) {
      handleFailure(failure);
    }
  }, [
    abortActiveCapture,
    clearRecording,
    copy.errors.deviceLost,
    copy.errors.preparePlayback,
    copy.errors.recorder,
    copy.errors.unsupported,
    handleFailure,
    startLevelMonitoring,
    stopRecording,
    updateStatus,
  ]);

  const release = useCallback(() => {
    abortActiveCapture();
    clearRecording();
    setError(null);
    updateStatus('idle');
  }, [abortActiveCapture, clearRecording, updateStatus]);

  const reportPlaybackError = useCallback(() => {
    setQuality({
      issues: ['unsupported-format'],
      message: copy.errors.playback,
      valid: false,
    });
    updateStatus('invalid');
  }, [copy.errors.playback, updateStatus]);

  useEffect(() => {
    const supportCheckTimeout = window.setTimeout(() => {
      if (!isRecordingSupported()) {
        setError({
          code: 'unsupported-format',
          message: copy.errors.unsupported,
        });
        updateStatus('unsupported');
      }
    }, 0);

    return () => window.clearTimeout(supportCheckTimeout);
  }, [copy.errors.unsupported, updateStatus]);

  useEffect(() => {
    if (status !== 'recorded' || !recording) {
      return;
    }

    updateStatus('validating');
    const validationTimeout = window.setTimeout(() => {
      const nextQuality = validateAudioQuality(
        {
          averageSignalLevel: recording.averageSignalLevel,
          blobSize: recording.blob.size,
          durationMs: recording.durationMs,
          mimeType: recording.mimeType,
          signalSampleCount: recording.signalSampleCount,
        },
        locale,
      );

      if (mountedRef.current) {
        setQuality(nextQuality);
        updateStatus(nextQuality.valid ? 'valid' : 'invalid');
      }
    }, 0);

    return () => window.clearTimeout(validationTimeout);
  }, [locale, recording, status, updateStatus]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      ignoreRecorderStopRef.current = true;
      abortActiveCapture();
      revokeObjectUrl(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [abortActiveCapture]);

  return {
    audioLevel,
    elapsedMs,
    error,
    maxDurationMs: voiceRecordingConfig.maxDurationMs,
    quality,
    recording,
    status,
    recordAgain: startRecording,
    reportPlaybackError,
    release,
    requestPermission,
    startRecording,
    stopRecording,
  };
}
