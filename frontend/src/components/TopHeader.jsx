import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';

export default function TopHeader({ title, subtitle, actions }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { toggleCollapse, toggleMobile } = useSidebar();

  const handleMenuClick = () => {
    if (window.innerWidth >= 992) {
      toggleCollapse();
    } else {
      toggleMobile();
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Single hamburger — collapse on desktop, drawer on mobile */}
        <button
          onClick={handleMenuClick}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: 20,
            cursor: 'pointer', padding: '6px 8px',
            borderRadius: 6, lineHeight: 1,
            display: 'flex', alignItems: 'center',
            transition: 'background 0.15s',
          }}
          title="Toggle sidebar"
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
        <button
          className="theme-toggle"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
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
