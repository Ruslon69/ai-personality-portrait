export const voiceRecordingConfig = Object.freeze({
  elapsedUpdateIntervalMs: 100,
  levelSampleIntervalMs: 100,
  lowSignalThreshold: 0.012,
  maxDurationMs: 60_000,
  minDurationMs: 8_000,
  minSignalSamples: 20,
  mimeTypeCandidates: [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ],
  recorderTimesliceMs: 250,
});

export const preparedReadingText =
  'Сегодня я решил ненадолго изменить привычный маршрут и пройтись по незнакомой улице. Погода была спокойной, вокруг слышались обычные городские звуки, а в окнах уже зажигался свет. По дороге я заметил небольшое кафе, остановился у витрины и подумал, что иногда полезно оставлять в дне место для случайных открытий. Потом я вернулся к своим делам, сохранив ощущение короткой паузы. Этот простой момент напомнил мне, что внимание к деталям помогает замечать больше, даже когда день кажется совершенно обычным.';
