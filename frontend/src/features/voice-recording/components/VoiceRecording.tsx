import { Badge, Button, Card, Container, Spinner, Stack, Surface, Typography } from '@shared/ui';

import { preparedReadingText } from '../config';
import { useVoiceRecording } from '../hooks';
import type { VoiceRecordingStatus } from '../types';
import { formatRecordingDuration } from '../utils';
import styles from './VoiceRecording.module.css';

type VoiceRecordingProps = {
  onBack: () => void;
  onContinue: () => void;
};

const statusLabels: Record<VoiceRecordingStatus, string> = {
  error: 'Нужна проверка',
  idle: 'Микрофон выключен',
  invalid: 'Лучше повторить',
  'permission-denied': 'Доступ не предоставлен',
  ready: 'Микрофон готов',
  recorded: 'Запись завершена',
  recording: 'Идёт запись',
  'requesting-permission': 'Проверяем доступ',
  unsupported: 'Запись недоступна',
  valid: 'Запись готова',
  validating: 'Проверяем запись',
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

function getSignalDescription(audioLevel: number | null, status: VoiceRecordingStatus) {
  if (status !== 'recording') {
    return 'Микрофон сейчас не записывает';
  }

  if (audioLevel === null) {
    return 'Измерение уровня недоступно, запись продолжается';
  }

  if (audioLevel < 0.08) {
    return 'Сигнал пока очень тихий';
  }

  if (audioLevel < 0.25) {
    return 'Сигнал обнаружен';
  }

  return 'Уровень сигнала достаточный';
}

export function VoiceRecording({ onBack, onContinue }: VoiceRecordingProps) {
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
  } = useVoiceRecording();

  const leaveStep = (destination: () => void) => {
    release();
    destination();
  };

  const useRecording = () => {
    if (status === 'valid') {
      leaveStep(onContinue);
    }
  };

  const statusDescription =
    error?.message ??
    (status === 'idle'
      ? 'Доступ запрашивается только после вашего действия.'
      : status === 'requesting-permission'
        ? 'Подтвердите доступ в системном окне браузера.'
        : status === 'ready'
          ? 'Доступ проверен, но запись ещё не началась.'
          : status === 'recording'
            ? 'Читайте текст в привычном темпе. Остановить запись можно в любой момент.'
            : status === 'recorded' || status === 'validating'
              ? 'Локально проверяем длительность, формат и уровень сигнала.'
              : status === 'valid'
                ? 'Можно прослушать запись, использовать её или записать заново.'
                : status === 'invalid'
                  ? 'Запись сохранена только в этой вкладке. Можно спокойно повторить попытку.'
                  : 'Голосовой этап можно пропустить без потери остального пути.');

  const currentDuration = recording?.durationMs ?? elapsedMs;
  const signalDescription = getSignalDescription(audioLevel, status);
  const showPlayback = recording && ['recorded', 'validating', 'valid', 'invalid'].includes(status);
  const isChecking = status === 'requesting-permission' || status === 'validating';

  const primaryAction =
    status === 'idle' ? (
      <Button className={styles.primaryButton} onClick={requestPermission}>
        Разрешить микрофон
      </Button>
    ) : status === 'ready' ? (
      <Button className={styles.primaryButton} onClick={startRecording}>
        Начать запись
      </Button>
    ) : status === 'recording' ? (
      <Button className={styles.stopButton} onClick={stopRecording}>
        Остановить запись
      </Button>
    ) : status === 'valid' ? (
      <Button
        aria-describedby="voice-quality-description"
        className={styles.primaryButton}
        onClick={useRecording}
      >
        Использовать запись
      </Button>
    ) : status === 'invalid' ? (
      <Button
        aria-describedby="voice-quality-description"
        className={styles.primaryButton}
        onClick={recordAgain}
      >
        Записать заново
      </Button>
    ) : status === 'permission-denied' || status === 'error' ? (
      <Button className={styles.primaryButton} onClick={requestPermission}>
        Проверить микрофон снова
      </Button>
    ) : status === 'unsupported' ? (
      <Button className={styles.primaryButton} onClick={() => leaveStep(onContinue)}>
        Продолжить без голоса
      </Button>
    ) : (
      <Button className={styles.primaryButton} disabled>
        {status === 'validating' ? 'Проверяем запись' : 'Ожидаем разрешение'}
      </Button>
    );

  return (
    <div className={styles.root}>
      <section aria-labelledby="voice-title" className={styles.introduction}>
        <Container size="default">
          <Stack className={styles.introductionContent} gap="md">
            <Typography as="p" className={styles.eyebrow} variant="caption">
              Необязательный этап
            </Typography>
            <Typography as="h1" className={styles.title} id="voice-title">
              Добавьте голос к портрету
            </Typography>
            <Typography className={styles.lead}>
              Короткая запись добавит наблюдения только об особенностях речи в этом фрагменте. Она
              не определяет личность и не используется для идентификации.
            </Typography>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="voice-privacy-title" className={styles.privacySection}>
        <Container size="default">
          <Surface className={styles.privacySurface} elevation="low">
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" className={styles.eyebrow} variant="caption">
                  Приватность
                </Typography>
                <Typography as="h2" id="voice-privacy-title" variant="heading-md">
                  Запись остаётся под вашим контролем
                </Typography>
              </Stack>
              <ul className={styles.privacyList}>
                <li>Голос можно пропустить.</li>
                <li>Аудио не отправляется на сервер.</li>
                <li>Исходная запись удаляется после анализа по умолчанию.</li>
                <li>После обновления страницы запись не сохраняется.</li>
              </ul>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-label="Подготовка и запись голоса" className={styles.workspaceSection}>
        <Container size="default">
          <div className={styles.workspaceGrid}>
            <Card aria-labelledby="reading-text-title" className={styles.scriptCard}>
              <Stack gap="lg">
                <Stack gap="sm">
                  <Typography as="p" className={styles.eyebrow} variant="caption">
                    Текст для чтения
                  </Typography>
                  <Typography as="h2" id="reading-text-title" variant="heading-lg">
                    Прочитайте в привычном темпе
                  </Typography>
                  <Typography variant="caption">
                    Ориентировочное время чтения — 30–45 секунд.
                  </Typography>
                </Stack>
                <Typography className={styles.readingText}>{preparedReadingText}</Typography>
              </Stack>
            </Card>

            <Card aria-labelledby="recording-panel-title" className={styles.recordingCard}>
              <Stack gap="lg">
                <Stack gap="sm">
                  <Stack align="center" direction="row" justify="between">
                    <Typography as="h2" id="recording-panel-title" variant="heading-lg">
                      Запись
                    </Typography>
                    <Badge tone={getStatusTone(status)}>{statusLabels[status]}</Badge>
                  </Stack>
                  <Typography aria-live="polite" className={styles.statusText} role="status">
                    {statusDescription}
                  </Typography>
                </Stack>

                <div className={styles.recordingMetrics}>
                  <div className={styles.metric}>
                    <Typography as="span" variant="caption">
                      Длительность
                    </Typography>
                    <time
                      aria-label={`Текущая длительность записи ${formatRecordingDuration(
                        currentDuration,
                      )}`}
                      className={styles.timer}
                      dateTime={`PT${Math.floor(currentDuration / 1000)}S`}
                    >
                      {formatRecordingDuration(currentDuration)}
                    </time>
                    <Typography as="span" variant="caption">
                      максимум {formatRecordingDuration(maxDurationMs)}
                    </Typography>
                  </div>

                  <div className={styles.metric}>
                    <Typography as="span" variant="caption">
                      Уровень сигнала
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
                        ? 'Проверяем техническое качество записи'
                        : 'Ожидаем разрешение на использование микрофона'
                    }
                  />
                ) : null}

                {showPlayback ? (
                  <Stack className={styles.playbackBlock} gap="sm">
                    <Typography as="h3" variant="heading-sm">
                      Прослушивание
                    </Typography>
                    <audio
                      aria-label="Прослушать записанный голос"
                      className={styles.audio}
                      controls
                      onError={reportPlaybackError}
                      preload="metadata"
                      src={recording.url}
                    />
                    <Typography variant="caption">
                      Длительность: {formatRecordingDuration(recording.durationMs)}
                    </Typography>
                  </Stack>
                ) : null}

                {quality ? (
                  <Surface
                    aria-label="Техническая оценка качества записи"
                    className={styles.qualityBlock}
                    role="status"
                  >
                    <Stack gap="xs">
                      <Typography as="h3" variant="heading-sm">
                        {quality.valid ? 'Запись подходит' : 'Запись лучше повторить'}
                      </Typography>
                      <Typography
                        aria-live="polite"
                        className={styles.statusText}
                        id="voice-quality-description"
                      >
                        {quality.message}
                      </Typography>
                    </Stack>
                  </Surface>
                ) : null}

                <div className={styles.actions}>
                  <Button onClick={() => leaveStep(onBack)}>Назад</Button>
                  <div className={styles.forwardActions}>
                    {status === 'valid' ? (
                      <Button onClick={recordAgain}>Записать заново</Button>
                    ) : null}
                    {status !== 'unsupported' ? (
                      <Button onClick={() => leaveStep(onContinue)}>Пропустить голос</Button>
                    ) : null}
                    {primaryAction}
                  </div>
                </div>
              </Stack>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
