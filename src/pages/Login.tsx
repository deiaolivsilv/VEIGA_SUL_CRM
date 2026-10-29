import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import { ArrowRight } from 'lucide-react';
import { playLoginSound } from '../utils/audio';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force load and play
    video.muted = true;
    video.load();

    const attemptPlay = () => {
      video.play().catch(() => {
        // Retry once after a short delay if first attempt fails
        setTimeout(() => video.play().catch(() => {}), 300);
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('loadeddata', attemptPlay, { once: true });
      video.addEventListener('canplay', attemptPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(username, password);
      playLoginSound();
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={styles.backgroundVideo}
      >
        <source src="/video-banner.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay}></div>

      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <img src="/logo.png" alt="Veiga Sul Equipamentos" className={styles.logoImage}
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        <h1 className={styles.title}>Bem-vindo de volta</h1>
        <p className={styles.subtitle}>Acesse o sistema de CRM comercial</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            <span>Entrar no Sistema</span>
            <ArrowRight size={18} />
          </button>

          <div className={styles.credentialsHint}>
            <p>Admin: <strong>admin</strong> / <strong>123456</strong></p>
            <p>Ana: <strong>vendedor-ana</strong> / <strong>123</strong></p>
            <p>Carlos: <strong>vendedor-carlos</strong> / <strong>123</strong></p>
            <p>Roberto: <strong>vendedor-roberto</strong> / <strong>123</strong></p>
            <p>Juliana: <strong>vendedor-juliana</strong> / <strong>123</strong></p>
            <p>Fernanda: <strong>vendedor-fernanda</strong> / <strong>123</strong></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
