import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const doctorLinks = [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/queue', icon: '⏳', label: 'Patient Queue' },
  ];

  const patientLinks = [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/book', icon: '📅', label: 'Book Appointment' },
    { path: '/doctors', icon: '👨‍⚕️', label: 'Find Doctors' },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">🏥 SmartDoc</div>
        <div className="sidebar-logo-sub">Appointment Management System</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {links.map((link) => (
          <button
            key={link.path}
            className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button
            className="sidebar-logout"
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
          >⇥</button>
        </div>
      </div>
    </aside>
  );
}
