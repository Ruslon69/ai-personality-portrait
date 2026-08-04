import styles from './PortraitProgress.module.css';

type Props = {
  currentLabel: string;
  label: string;
  remainingLabel: string;
  total: number;
  value: number;
};

export function PortraitProgress({ currentLabel, label, remainingLabel, total, value }: Props) {
  return (
    <div
      aria-label={label}
      aria-valuemax={total}
      aria-valuemin={0}
      aria-valuenow={value}
      className={styles.root}
      role="progressbar"
    >
      <div aria-hidden="true" className={styles.map}>
        <span className={styles.core} />
        {Array.from({ length: total }, (_, index) => (
          <span className={styles.node} data-complete={index < value || undefined} key={index} />
        ))}
      </div>
      <div className={styles.copy}>
        <strong>{currentLabel}</strong>
        <span>{remainingLabel}</span>
      </div>
    </div>
  );
}
