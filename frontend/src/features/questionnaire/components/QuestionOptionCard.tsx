import type {
  QuestionOption as QuestionOptionData,
  QuestionPresentation,
  QuestionType,
} from '../types';
import styles from './QuestionOptionCard.module.css';

type QuestionOptionCardProps = {
  checked: boolean;
  name: string;
  onChange: (optionId: string) => void;
  option: QuestionOptionData;
  order?: number;
  presentation: QuestionPresentation;
  type: QuestionType;
};

export function QuestionOptionCard({
  checked,
  name,
  onChange,
  option,
  order,
  presentation,
  type,
}: QuestionOptionCardProps) {
  return (
    <label className={styles.root} data-presentation={presentation}>
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
      {order ? (
        <span aria-hidden="true" className={styles.order}>
          {order}
        </span>
      ) : null}
    </label>
  );
}
