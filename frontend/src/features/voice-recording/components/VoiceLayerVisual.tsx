import type { CSSProperties } from 'react';

import type { VoiceRecordingStatus } from '../types';
import styles from './VoiceLayerVisual.module.css';

type Props = { level: number | null; status: VoiceRecordingStatus };
const weights = [0.35, 0.7, 0.48, 0.92, 0.6, 0.42, 0.82, 0.55, 0.3, 0.68, 0.44, 0.78];

export function VoiceLayerVisual({ level, status }: Props) {
  const activeLevel =
    status === 'recording' ? Math.max(0.18, level ?? 0.18) : status === 'valid' ? 0.55 : 0.22;
  return (
    <div aria-hidden="true" className={styles.root} data-status={status}>
      <span className={styles.orbit} />
      <div className={styles.wave}>
        {weights.map((weight, index) => (
          <i
            key={index}
            style={
              { '--bar-level': Math.min(1, activeLevel * 1.7 + weight * 0.35) } as CSSProperties
            }
          />
        ))}
      </div>
      <span className={styles.core} />
    </div>
  );
}
