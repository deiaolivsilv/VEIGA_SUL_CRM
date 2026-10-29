
import styles from './Home.module.css';
import { useTheme } from '../context/ThemeContext';

export default function Home(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={styles.container}>
      <button onClick={toggleTheme} className={styles.button}>
        {isDark ? '☀️ Claro' : '🌙 Escuro'}
      </button>
    </div>
  );
}