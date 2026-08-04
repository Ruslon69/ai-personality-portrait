import styles from './QuestionScene.module.css';

type Props = { active: boolean; category: string; questionId: string };

export function QuestionScene({ active, category, questionId }: Props) {
  const scene = questionId.includes('unfinished')
    ? 'completion'
    : questionId.includes('feedback')
      ? 'feedback'
      : questionId.includes('plans-change')
        ? 'change'
        : category;
  return (
    <div
      aria-hidden="true"
      className={styles.root}
      data-active={active || undefined}
      data-scene={scene}
    >
      <span className={styles.core} />
      <span className={styles.element} data-element="1" />
      <span className={styles.element} data-element="2" />
      <span className={styles.element} data-element="3" />
      <span className={styles.path} data-path="1" />
      <span className={styles.path} data-path="2" />
    </div>
  );
}
