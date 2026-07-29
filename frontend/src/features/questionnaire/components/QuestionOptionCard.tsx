import type { QuestionOption as QuestionOptionData, QuestionType } from '../types';
import styles from './QuestionOptionCard.module.css';

type QuestionOptionCardProps = {
  checked: boolean;
  name: string;
  onChange: (optionId: string) => void;
  option: QuestionOptionData;
  type: QuestionType;
};

export function QuestionOptionCard({
  checked,
  name,
  onChange,
  option,
  type,
}: QuestionOptionCardProps) {
  return (
    <label className={styles.root}>
      <input
        checked={checked}
        className={styles.control}
        name={name}
        onChange={() => onChange(option.id)}
        type={type === 'single' ? 'radio' : 'checkbox'}
        value={option.id}
      />
      <span aria-hidden="true" className={styles.indicator} />
      <span className={styles.label}>{option.label}</span>
    </label>
  );
}
