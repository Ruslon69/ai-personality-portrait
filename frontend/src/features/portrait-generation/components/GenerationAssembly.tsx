import type { CSSProperties } from 'react';

import type { DraftPortrait, ProfileLocale } from '@entities/personality-profile';

import styles from './GenerationAssembly.module.css';

type Props = {
  draft: DraftPortrait;
  locale: ProfileLocale;
  stageIndex: number;
  stageCount: number;
};
export function GenerationAssembly({ draft, locale, stageIndex, stageCount }: Props) {
  const labels = {
    en: {
      answers: 'Answers',
      interests: 'Interests',
      voice: 'Voice',
      date: 'Date lens',
      engine: 'Pattern engine',
    },
    ru: {
      answers: 'Ответы',
      interests: 'Интересы',
      voice: 'Голос',
      date: 'Линза даты',
      engine: 'Связи',
    },
    uk: {
      answers: 'Відповіді',
      interests: 'Інтереси',
      voice: 'Голос',
      date: 'Лінза дати',
      engine: 'Зв’язки',
    },
  }[locale];
  const sources = [
    { id: 'answers', label: labels.answers, show: true },
    { id: 'interests', label: labels.interests, show: draft.interests.length > 0 },
    { id: 'voice', label: labels.voice, show: draft.voice.status === 'included' },
    { id: 'date', label: labels.date, show: draft.birthDate.status === 'included' },
  ].filter((item) => item.show);
  const progress = stageIndex / Math.max(1, stageCount - 1);
  const style = {
    '--assembly-offset': 100 - progress * 100,
    '--assembly-opacity': 0.28 + progress * 0.72,
    '--assembly-rotation': `${progress * 45}deg`,
  } as CSSProperties;
  return (
    <div aria-hidden="true" className={styles.root} style={style}>
      <svg className={styles.lines} viewBox="0 0 100 100">
        {sources.map((_, index) => (
          <path d={`M${12 + index * 25} 18 Q50 ${36 + index * 4} 50 52`} key={index} />
        ))}
      </svg>
      <div className={styles.sources}>
        {sources.map((source) => (
          <span data-source={source.id} key={source.id}>
            {source.label}
          </span>
        ))}
      </div>
      <div className={styles.engine}>
        <i />
        <strong>{labels.engine}</strong>
      </div>
      <div className={styles.mark}>
        <i />
        <i />
        <i />
        <b />
      </div>
    </div>
  );
}
