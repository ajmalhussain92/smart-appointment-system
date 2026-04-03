import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const doctorLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',     label: 'Dashboard' },
    { path: '/dashboard', icon: 'bi-people-fill',        label: 'Patient Queue' },
  ];

  const patientLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',       label: 'Dashboard' },
    { path: '/book',      icon: 'bi-calendar-plus-fill',   label: 'Book Appointment' },
    { path: '/doctors',   icon: 'bi-person-badge-fill',    label: 'Find Doctors' },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  const handleNav = (path) => navigate(path);

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <div className="sidebar-brand-name">SmartDoc</div>
          <div className="sidebar-brand-sub">Appointment System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {links.map((link, i) => (
          <button
            key={i}
            className={`nav-item ${isActive(link.path) && i === 0 ? 'active' : isActive(link.path) && i > 0 ? '' : isActive(link.path) ? 'active' : ''}`}
            style={isActive(link.path) && link.label !== 'Patient Queue' ? {} : {}}
            onClick={() => handleNav(link.path)}
          >
            <i className={`bi ${link.icon}`} />
            {link.label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Account</div>
        <button className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
          <i className="bi bi-box-arrow-right" />
          Logout
        </button>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div className="user-role">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
