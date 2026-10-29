import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, KanbanSquare, Users, CalendarDays, BarChart3, ChevronLeft, ChevronRight, LogOut, AlertTriangle, Menu, X, History, UserCog, Sun, Moon } from 'lucide-react';
import styles from './Layout.module.css';
import { useData } from '../context/DataContext';
import GlobalSearch from '../components/GlobalSearch';
import { playLogoutSound } from '../utils/audio';

const INACTIVITY_MS = 5 * 60 * 1000;   // 5 minutes
const WARNING_MS   = 60 * 1000;         // warn 60s before logout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { leads } = useData();

  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowWarning(false);
    playLogoutSound();
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const resetTimers = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowWarning(false);
    warningTimer.current = setTimeout(() => setShowWarning(true), INACTIVITY_MS - WARNING_MS);
    logoutTimer.current  = setTimeout(() => handleLogout(), INACTIVITY_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetTimers();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimers();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (logoutTimer.current)  clearTimeout(logoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [resetTimers]);

  // Close mobile sidebar on route transition
  const handleMobileNavLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className={styles.appContainer}>
      {/* Inactivity warning banner */}
      {showWarning && (
        <div className={styles.inactivityBanner}>
          <AlertTriangle size={16} />
          <span>Você será desconectado por inatividade em <strong>60 segundos</strong>.</span>
          <button onClick={resetTimers} className={styles.inactivityKeepBtn}>Continuar sessão</button>
          <button onClick={handleLogout} className={styles.inactivityLogoutBtn}>Sair agora</button>
        </div>
      )}

      {/* Mobile Top Navbar */}
      <header className={styles.mobileHeader}>
        <button className={styles.hamburgerBtn} onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <Menu size={24} />
        </button>
        <div className={styles.mobileTitleArea}>
          <img src="/logo-without-sub.png" alt="Veiga Sul" className={styles.mobileLogoImage} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="' + styles.mobileTitle + '">Veiga Sul CRM</span>' }} />
        </div>
        <button className={styles.mobileLogoutBtn} onClick={handleLogout} title="Sair">
          <LogOut size={20} />
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logoArea}>
          {!collapsed ? (
            <img src="/logo-without-sub.png" alt="Veiga Sul" className={styles.logoImage} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="' + styles.logoText + '">Veiga Sul</span>' }} />
          ) : (
            <img src="/icon.png" alt="VS" className={styles.iconImage} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<div class="' + styles.logoCircle + '">V</div>' }} />
          )}
          {/* Close button inside sidebar on mobile */}
          <button className={styles.mobileCloseBtn} onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X size={24} />
          </button>
        </div>

        <div className={styles.navSection}>
          <nav className={styles.nav}>
            {!collapsed && <span className={styles.navSectionTitle}>PRINCIPAL</span>}
            <NavLink to="/dashboard" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <LayoutDashboard size={20} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/pipeline" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <KanbanSquare size={20} />
              {!collapsed && <span>Pipeline</span>}
            </NavLink>
            <NavLink to="/leads" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Users size={20} />
              {!collapsed && <span>Leads</span>}
              {!collapsed && <span className={styles.navBadge}>{leads.length}</span>}
            </NavLink>
            <NavLink to="/agenda" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <CalendarDays size={20} />
              {!collapsed && <span>Agenda</span>}
            </NavLink>

            {user?.role === 'admin' && (
              <div className={styles.adminNavSection}>
                <div className={styles.divider}></div>
                {!collapsed && <span className={styles.navSectionTitle}>ADMINISTRAÇÃO</span>}
                <NavLink to="/reports" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <BarChart3 size={20} />
                  {!collapsed && <span>Relatórios</span>}
                </NavLink>

                <NavLink to="/audit" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <History size={20} />
                  {!collapsed && <span>Auditoria</span>}
                </NavLink>
                <NavLink to="/settings" onClick={handleMobileNavLinkClick} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <UserCog size={20} />
                  {!collapsed && <span>Usuários</span>}
                </NavLink>
              </div>
            )}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerActions}>
            {!collapsed && (
              <div className={styles.userInfoStack}>
                <span className={styles.userName}>{user?.name.split(' ')[0]}</span>
                <span className={styles.userRoleText}>{user?.role === 'admin' ? 'Admin' : 'Vendedor'}</span>
              </div>
            )}
<button className={styles.iconButton} onClick={toggleTheme} title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={styles.iconButton} onClick={handleLogout} title="Sair">
              <LogOut size={18} />
            </button>
          </div>

          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir' : 'Recolher'}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>

      <GlobalSearch />
    </div>
  );
};

export default MainLayout;
