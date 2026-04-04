import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';

export default function Sidebar({ collapsed, mobileOpen }) {
  const { user } = useAuth();
  const { toggleCollapse } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const doctorLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
  ];

  const patientLinks = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill',       label: 'Dashboard' },
    { path: '/book',      icon: 'bi-calendar-plus-fill',   label: 'Book Appointment' },
    { path: '/doctors',   icon: 'bi-person-badge-fill',    label: 'Find Doctors' },
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
            className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => { navigate(link.path); toggleCollapse(); }}
            title={collapsed ? link.label : ''}
          >
            <i className={`bi ${link.icon}`} />
            {!collapsed && <span className="nav-label">{link.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer — collapse toggle button only */}
      <div className="sidebar-footer">
        <button
          onClick={toggleCollapse}
          className="nav-item"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: 0 }}
        >
          <i className={`bi ${collapsed ? 'bi-layout-sidebar-reverse' : 'bi-layout-sidebar'}`} />
          {!collapsed && <span className="nav-label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
