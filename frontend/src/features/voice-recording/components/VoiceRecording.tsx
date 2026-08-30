import { useEffect, useRef, useState } from 'react';

import type { DraftVoiceSelection } from '@entities/personality-profile';
import { useI18n } from '@shared/i18n';
import { Badge, Button, Card, Container, Spinner, Stack, Surface, Typography } from '@shared/ui';

import { voiceRecordingCopy } from '../data';
import { useVoiceRecording } from '../hooks';
import type { VoiceRecordingStatus } from '../types';
import { formatRecordingDuration } from '../utils';
import styles from './VoiceRecording.module.css';
import { VoiceLayerVisual } from './VoiceLayerVisual';

type VoiceRecordingProps = {
  onBack: () => void;
  onComplete: (result: DraftVoiceSelection) => void;
};

function getStatusTone(status: VoiceRecordingStatus) {
  if (status === 'valid') {
    return 'success' as const;
  }

  if (status === 'invalid' || status === 'permission-denied' || status === 'error') {
    return 'warning' as const;
  }

  return 'info' as const;
}

function getSignalDescription(
  audioLevel: number | null,
  status: VoiceRecordingStatus,
  copy: (typeof voiceRecordingCopy)['ru']['signal'],
) {
  if (status !== 'recording') {
    return copy.idle;
  }

  if (audioLevel === null) {
    return copy.unavailable;
  }

  if (audioLevel < 0.08) {
    return copy.quiet;
  }

  if (audioLevel < 0.25) {
    return copy.detected;
  }

  return copy.good;
}

export function VoiceRecording({ onBack, onComplete }: VoiceRecordingProps) {
  const { locale } = useI18n();
  const copy = voiceRecordingCopy[locale];
  const [skipMessage, setSkipMessage] = useState('');
  const skipTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (skipTimerRef.current !== null) window.clearTimeout(skipTimerRef.current);
    },
    [],
  );
  const {
    audioLevel,
    elapsedMs,
    error,
    maxDurationMs,
    quality,
    recording,
    status,
    recordAgain,
    reportPlaybackError,
    release,
    requestPermission,
    startRecording,
    stopRecording,
  } = useVoiceRecording(locale);

  const leaveStep = (destination: () => void) => {
    release();
    destination();
  };

  const useRecording = () => {
    if (status === 'valid' && recording) {
      const result: DraftVoiceSelection = {
        averageSignalLevel: recording.averageSignalLevel,
        durationMs: recording.durationMs,
        mimeType: recording.mimeType,
        status: 'included',
      };
      leaveStep(() => onComplete(result));
    }
  };

  const skipRecording = () => {
    setSkipMessage(copy.skipMessage);
    skipTimerRef.current = window.setTimeout(
      () => leaveStep(() => onComplete({ status: 'skipped' })),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380,
    );
  };

  const statusDescription = error?.message ?? copy.statusDescriptions[status];

  const currentDuration = recording?.durationMs ?? elapsedMs;
  const signalDescription = getSignalDescription(audioLevel, status, copy.signal);
  const showPlayback = recording && ['recorded', 'validating', 'valid', 'invalid'].includes(status);
  const isChecking = status === 'requesting-permission' || status === 'validating';

  const primaryAction =
    status === 'idle' ? (
      <Button onClick={requestPermission} prominence="primary" size="large">
        {copy.actions.allow}
      </Button>
    ) : status === 'ready' ? (
      <Button onClick={startRecording} prominence="primary" size="large">
        {copy.actions.start}
      </Button>
    ) : status === 'recording' ? (
      <Button onClick={stopRecording} prominence="primary" size="large">
        {copy.actions.stop}
      </Button>
    ) : status === 'valid' ? (
      <Button
        aria-describedby="voice-quality-description"
        onClick={useRecording}
        prominence="primary"
        size="large"
      >
        {copy.actions.use}
      </Button>
    ) : status === 'invalid' ? (
      <Button
        aria-describedby="voice-quality-description"
        onClick={recordAgain}
        prominence="primary"
        size="large"
      >
        {copy.actions.recordAgain}
      </Button>
    ) : status === 'permission-denied' || status === 'error' ? (
      <Button onClick={requestPermission} prominence="primary" size="large">
        {copy.actions.requestAgain}
      </Button>
    ) : status === 'unsupported' ? (
      <Button onClick={skipRecording} prominence="primary" size="large">
        {copy.actions.continueWithout}
      </Button>
    ) : (
      <Button disabled prominence="primary" size="large">
        {status === 'validating' ? copy.actions.checking : copy.actions.waiting}
      </Button>
    );

  return (
    <div className={styles.root}>
      <section aria-labelledby="voice-title" className={styles.introduction}>
        <Container size="default">
          <Stack className={styles.introductionContent} gap="md">
            <Typography as="p" variant="eyebrow">
              {copy.introduction.eyebrow}
            </Typography>
            <Typography as="h1" className={styles.title} id="voice-title" variant="flow-title">
              {copy.introduction.title}
            </Typography>
            <Typography className={styles.lead} variant="flow-lead">
              {copy.introduction.lead}
            </Typography>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="voice-privacy-title" className={styles.privacySection}>
        <Container size="default">
          <Surface className={styles.privacySurface} elevation="low">
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {copy.privacy.eyebrow}
                </Typography>
                <Typography as="h2" id="voice-privacy-title" variant="heading-md">
                  {copy.privacy.title}
                </Typography>
              </Stack>
              <ul className={styles.privacyList}>
                {copy.privacy.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-label={copy.workspaceLabel} className={styles.workspaceSection}>
        <Container size="default">
          <div className={styles.workspaceGrid}>
            <Card aria-labelledby="reading-text-title" className={styles.scriptCard}>
              <Stack gap="lg">
                <Stack gap="sm">
                  <Typography as="p" variant="eyebrow">
                    {copy.script.eyebrow}
                  </Typography>
                  <Typography as="h2" id="reading-text-title" variant="heading-lg">
                    {copy.script.title}
                  </Typography>
                  <Typography variant="caption">{copy.script.duration}</Typography>
                </Stack>
                <Typography className={styles.readingText}>{copy.readingText}</Typography>
              </Stack>
            </Card>

            <Card aria-labelledby="recording-panel-title" className={styles.recordingCard}>
              <Stack gap="lg">
                <VoiceLayerVisual level={audioLevel} status={status} />
                <Stack gap="sm">
                  <Stack align="center" direction="row" justify="between">
                    <Typography as="h2" id="recording-panel-title" variant="heading-lg">
                      {copy.panel.recording}
                    </Typography>
                    <Badge tone={getStatusTone(status)}>{copy.statusLabels[status]}</Badge>
                  </Stack>
                  <Typography aria-live="polite" className={styles.statusText} role="status">
                    {statusDescription}
                  </Typography>
                </Stack>

                <div className={styles.recordingMetrics}>
                  <div className={styles.metric}>
                    <Typography as="span" variant="caption">
                      {copy.panel.duration}
                    </Typography>
                    <time
                      aria-label={copy.panel.currentDuration(
                        formatRecordingDuration(currentDuration),
                      )}
                      className={styles.timer}
                      dateTime={`PT${Math.floor(currentDuration / 1000)}S`}
                    >
                      {formatRecordingDuration(currentDuration)}
                    </time>
                    <Typography as="span" variant="caption">
                      {copy.panel.maximum(formatRecordingDuration(maxDurationMs))}
                    </Typography>
                  </div>

                  <div className={styles.metric}>
                    <Typography as="span" variant="caption">
                      {copy.panel.signal}
                    </Typography>
                    <meter
                      aria-label={signalDescription}
                      className={styles.levelMeter}
                      max={1}
                      min={0}
                      value={audioLevel ?? 0}
                    />
                    <Typography as="span" className={styles.signalText} variant="caption">
                      {signalDescription}
                    </Typography>
                  </div>
                </div>

                {isChecking ? (
                  <Spinner
                    label={
                      status === 'validating'
                        ? copy.panel.spinnerValidation
                        : copy.panel.spinnerPermission
                    }
                  />
                ) : null}

                {showPlayback ? (
                  <Stack className={styles.playbackBlock} gap="sm">
                    <Typography as="h3" variant="heading-sm">
                      {copy.panel.playback}
                    </Typography>
                    <audio
                      aria-label={copy.panel.playbackLabel}
                      className={styles.audio}
                      controls
                      onError={reportPlaybackError}
                      preload="metadata"
                      src={recording.url}
                    />
                    <Typography variant="caption">
                      {copy.panel.duration}: {formatRecordingDuration(recording.durationMs)}
                    </Typography>
                  </Stack>
                ) : null}

                {quality ? (
                  <Surface
                    aria-label={copy.panel.qualityLabel}
                    className={styles.qualityBlock}
                    role="status"
                  >
                    <Stack gap="xs">
                      <Typography as="h3" variant="heading-sm">
                        {quality.valid ? copy.panel.qualityGood : copy.panel.qualityBad}
                      </Typography>
                      <Typography className={styles.statusText} id="voice-quality-description">
                        {quality.message}
                      </Typography>
                    </Stack>
                  </Surface>
                ) : null}

                <div className={styles.actions}>
                  <Button onClick={() => leaveStep(onBack)}>{copy.actions.back}</Button>
                  <div className={styles.forwardActions}>
                    {status === 'valid' ? (
                      <Button onClick={recordAgain}>{copy.actions.recordAgain}</Button>
                    ) : null}
                    {status !== 'unsupported' ? (
                      <Button onClick={skipRecording}>{copy.actions.skip}</Button>
                    ) : null}
                    {primaryAction}
                  </div>
                </div>
                <span aria-live="polite" className={styles.skipStatus}>
                  {skipMessage}
                </span>
              </Stack>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
