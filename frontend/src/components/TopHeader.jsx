import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function TopHeader({ title, subtitle, actions, onMenuToggle }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="btn btn-sm d-lg-none"
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, padding: '4px 8px' }}
          onClick={onMenuToggle}
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
        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
        </button>

        {/* Role badge */}
        <span className={`badge-status ${user?.role === 'doctor' ? 'badge-doctor' : 'badge-patient'}`}>
          <i className={`bi ${user?.role === 'doctor' ? 'bi-person-badge' : 'bi-person'}`} />
          {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
        </span>
      </div>
    </header>
  );
}
