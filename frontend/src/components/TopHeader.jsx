import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';

export default function TopHeader({ title, subtitle, actions }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Hamburger — mobile only */}
        <button
          className="d-lg-none"
          onClick={toggleSidebar}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text)', fontSize: 22,
            cursor: 'pointer', padding: '4px 8px',
            marginRight: 4,
          }}
        >
          <i className="bi bi-list" />
        </button>
        <div>
          <div className="header-page-title">{title}</div>
          {subtitle && <div className="header-breadcrumb">{subtitle}</div>}
        </div>
      </div>

      <div className="header-right">
        {actions}

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggle} title="Toggle dark/light mode">
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
        </button>

        {/* Role badge */}
        {user && (
          <span className={`badge-status ${user.role === 'doctor' ? 'badge-doctor' : 'badge-patient'}`}>
            <i className={`bi ${user.role === 'doctor' ? 'bi-person-badge-fill' : 'bi-person-fill'} me-1`} />
            {user.role === 'doctor' ? 'Doctor' : 'Patient'}
          </span>
        )}
      </div>
    </header>
  );
}
