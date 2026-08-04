import type { CSSProperties } from 'react';

import type { PortraitVisualIdentity } from '../model';
import styles from './PortraitMark.module.css';

type PortraitMarkProps = {
  className?: string;
  identity: PortraitVisualIdentity;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

const nodePositions = [
  [50, 8],
  [79, 18],
  [92, 48],
  [78, 79],
  [49, 92],
  [20, 79],
  [8, 49],
  [21, 19],
] as const;

export function PortraitMark({ className, identity, label, size = 'md' }: PortraitMarkProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  const seedValue = [...identity.seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  const rotation = seedValue % 30;
  const style = { '--mark-rotation': `${rotation}deg` } as CSSProperties;

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classes}
      data-accent={identity.accent}
      data-motif={identity.motif}
      data-shape={identity.shape}
      data-size={size}
      role={label ? 'img' : undefined}
      style={style}
      viewBox="0 0 100 100"
    >
      <g className={styles.orbits}>
        {Array.from({ length: identity.orbitCount }, (_, index) => (
          <ellipse key={index} cx="50" cy="50" rx={24 + index * 9} ry={19 + index * 7} />
        ))}
      </g>
      <g className={styles.connections}>
        {nodePositions.slice(0, identity.nodeCount).map(([x, y], index) => (
          <path d={`M50 50 Q${50 + (y - 50) / 4} ${50 + (50 - x) / 4} ${x} ${y}`} key={index} />
        ))}
      </g>
      <g className={styles.nodes}>
        {nodePositions.slice(0, identity.nodeCount).map(([x, y], index) => (
          <circle cx={x} cy={y} key={index} r={index % 3 === 0 ? 2.4 : 1.7} />
        ))}
      </g>
      <g className={styles.core}>
        <path
          d={
            identity.shape === 'diamond'
              ? 'M50 32 67 50 50 68 33 50Z'
              : identity.shape === 'arc'
                ? 'M32 56A19 19 0 1 1 68 56 20 20 0 0 0 32 56Z'
                : 'M50 31A19 19 0 1 1 50 69A19 19 0 1 1 50 31Z'
          }
        />
        <circle cx="50" cy="50" r="5" />
      </g>
      <g className={styles.signature}>
        <path d="M27 67 39 59 52 64 72 36" />
        <path d="M30 34h12M58 72h14" />
      </g>
    </svg>
  );
}
