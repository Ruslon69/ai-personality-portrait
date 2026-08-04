import styles from './InterestConstellation.module.css';

type Props = { labels: readonly string[]; selected: readonly string[] };
const positions = [
  [18, 25],
  [50, 13],
  [80, 28],
  [72, 70],
  [42, 82],
  [14, 65],
] as const;

export function InterestConstellation({ labels, selected }: Props) {
  return (
    <div
      aria-hidden="true"
      className={styles.root}
      data-complete={selected.length >= 6 || undefined}
      data-pattern={selected.length >= 3 || undefined}
    >
      <svg className={styles.lines} viewBox="0 0 100 100">
        {positions.slice(0, Math.max(0, selected.length - 1)).map(([x, y], index) => {
          const next = positions[index + 1] ?? positions[0];
          return <path d={`M${x} ${y} Q50 50 ${next[0]} ${next[1]}`} key={index} />;
        })}
      </svg>
      <span className={styles.core} />
      {selected.slice(0, 6).map((id, index) => (
        <span
          className={styles.node}
          key={id}
          style={{
            insetInlineStart: `${positions[index]?.[0] ?? 50}%`,
            insetBlockStart: `${positions[index]?.[1] ?? 50}%`,
          }}
        >
          <i />
          {labels[index]}
        </span>
      ))}
    </div>
  );
}
