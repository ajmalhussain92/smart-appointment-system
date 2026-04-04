import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopHeader({ title, subtitle, actions }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      {/* Left */}
      <div className="header-left">
        <div>
          <div className="header-page-title">{title}</div>
          {subtitle && <div className="header-breadcrumb">{subtitle}</div>}
        </div>
      </div>

      {/* Right */}
      <div className="header-right">
        {actions}

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
        </button>

        {/* Profile dropdown */}
        {user && (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '5px 10px 5px 6px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
              <i className={`bi bi-chevron-${dropOpen ? 'up' : 'down'}`} style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }} />
            </button>

            {/* Dropdown */}
            {dropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10, minWidth: 200,
                boxShadow: 'var(--shadow-md)',
                zIndex: 999,
                animation: 'fadeIn 0.15s ease',
                overflow: 'hidden',
              }}>
                {/* Profile info */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                      color: '#fff', fontSize: 15, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={handleLogout}
                    style={{ ...dropItemStyle, color: 'var(--danger)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <i className="bi bi-box-arrow-right" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

const dropItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '8px 10px',
  background: 'none', border: 'none',
  borderRadius: 6, cursor: 'pointer',
  fontSize: 13, fontWeight: 500,
  color: 'var(--text)', textAlign: 'left',
  transition: 'background 0.1s',
};
