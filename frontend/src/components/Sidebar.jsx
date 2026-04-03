import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const doctorLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { path: '/queue',     icon: 'bi-people-fill',   label: 'Patient Queue' },
  ];

  const patientLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',    label: 'Dashboard' },
    { path: '/book',      icon: 'bi-calendar-plus-fill', label: 'Book Appointment' },
    { path: '/doctors',   icon: 'bi-person-badge-fill',  label: 'Find Doctors' },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="bi bi-hospital-fill text-white" style={{ fontSize: 18 }} />
        </div>
        <div>
          <div className="sidebar-brand-name">SmartDoc</div>
          <div className="sidebar-brand-sub">Appointment System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map(link => (
          <button
            key={link.path}
            className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <i className={`bi ${link.icon}`} />
            {link.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name text-truncate">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4, fontSize: 18 }}
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}
