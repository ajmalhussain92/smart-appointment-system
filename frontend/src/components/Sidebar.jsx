import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ collapsed, mobileOpen }) {
  const { user, logout } = useAuth();
  const { toggleCollapse } = useSidebar();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const doctorLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',     label: 'Dashboard' },
    { path: '/dashboard', icon: 'bi-people-fill',        label: 'Patient Queue' },
  ];

  const patientLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',      label: 'Dashboard' },
    { path: '/book',      icon: 'bi-calendar-plus-fill',  label: 'Book Appointment' },
    { path: '/doctors',   icon: 'bi-person-badge-fill',   label: 'Find Doctors' },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 16 }} />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-brand-name">SmartDoc</div>
            <div className="sidebar-brand-sub">Appointment System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">Main Menu</div>}
        {links.map((link, i) => (
          <button
            key={i}
            className={`nav-item ${isActive(link.path) && i === 0 ? 'active' : ''}`}
            onClick={() => { navigate(link.path); toggleCollapse(); }}
            title={collapsed ? link.label : ''}
          >
            <i className={`bi ${link.icon}`} />
            {!collapsed && <span className="nav-label">{link.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="sidebar-footer">
        {/* Theme toggle in sidebar */}
        <button
          onClick={toggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '9px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(255,255,255,0.04)',
            border: 'none',
            borderRadius: 6,
            color: theme === 'dark' ? '#fbbf24' : '#94a3b8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 8,
            transition: 'all 0.15s',
          }}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} style={{ fontSize: 16, flexShrink: 0 }} />
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          {!collapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div className="user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11, color: 'var(--sidebar-text)' }}>
                {user?.role}
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', cursor: 'pointer',
              padding: 4, fontSize: 17, flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}
