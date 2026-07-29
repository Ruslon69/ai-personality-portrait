import type { MainProps } from './Main.types';
import styles from './Main.module.css';

export function Main({ children }: MainProps) {
  return (
    <main className={styles.root} id="app-content" tabIndex={-1}>
      {children}
    </main>
  );
}
