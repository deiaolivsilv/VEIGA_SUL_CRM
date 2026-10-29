import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.card}>
        <img src="/logo.png" alt="Veiga Sul" className={styles.logo} />
        <div className={styles.errorCode}>404</div>
        <div className={styles.divider}></div>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.description}>
          A página que você está procurando não existe ou foi movida. 
          Verifique o endereço e tente novamente.
        </p>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
