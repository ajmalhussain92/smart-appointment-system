import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: '#3b82f6', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>SmartDoc</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggle} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14,
            color: theme === 'dark' ? '#fbbf24' : '#6366f1',
          }}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
          </button>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary btn-sm" style={{ fontSize: 13 }}>
            {user ? 'Dashboard' : 'Sign In'}
            <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
          padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          marginBottom: 20, border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <i className="bi bi-trophy-fill" style={{ fontSize: 10 }} />
          Hackathon Project — HealthTech Track
        </div>

        <h1 style={{
          fontSize: 46, fontWeight: 900, lineHeight: 1.1,
          letterSpacing: -2, marginBottom: 16, color: 'var(--text)',
        }}>
          Smart Appointment<br />
          <span style={{ color: '#3b82f6' }}>Scheduling System</span>
        </h1>

        <p style={{
          fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
          maxWidth: 500, margin: '0 auto 28px',
        }}>
          An intelligent appointment management system that optimizes scheduling,
          reduces patient waiting time, and improves operational efficiency.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            <i className="bi bi-arrow-right-circle-fill me-2" />
            {user ? 'Open Dashboard' : 'Get Started Free'}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-outline-secondary" style={{ padding: '10px 24px', fontSize: 14 }}>
              <i className="bi bi-play-circle me-2" />
              View Demo
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36, flexWrap: 'wrap' }}>
          {[
            { value: '5+', label: 'Doctors' },
            { value: '12', label: 'Time Slots' },
            { value: '30s', label: 'Live Refresh' },
            { value: '100%', label: 'Real-time' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#3b82f6', letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
        }}>
          {[
            { icon: 'bi-lightning-charge-fill', color: '#f59e0b', title: 'Real-time Queue',    desc: 'Live queue position and estimated waiting time. Auto-refreshes every 30 seconds.' },
            { icon: 'bi-bar-chart-line-fill',   color: '#3b82f6', title: 'Doctor Analytics',   desc: 'Track utilization rates, completion stats, and workload distribution per doctor.' },
            { icon: 'bi-bell-fill',             color: '#8b5cf6', title: 'Smart Alerts',        desc: 'Automatic no-show detection, overdue appointment warnings, and upcoming reminders.' },
            { icon: 'bi-calendar-check-fill',   color: '#10b981', title: 'Slot Management',     desc: 'Prevent double booking with intelligent conflict detection and slot locking.' },
            { icon: 'bi-shield-lock-fill',      color: '#ef4444', title: 'Role-based Access',   desc: 'Separate secure dashboards for doctors and patients with JWT authentication.' },
            { icon: 'bi-moon-stars-fill',       color: '#6366f1', title: 'Dark / Light Mode',   desc: 'Full dark and light theme support with instant toggle and persistent preference.' },
          ].map((f, i) => (
            <div key={f.title} style={{
              padding: '24px 20px',
              background: 'var(--surface)',
              borderRight: i % 3 !== 2 ? '1px solid var(--border)' : 'none',
              borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: f.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: 16 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--surface)' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 10, letterSpacing: -0.5 }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Register as a doctor or patient and experience smart scheduling.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: 14 }}>
          <i className="bi bi-person-plus-fill me-2" />
          Create Account
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface)', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © 2025 SmartDoc — Built for Hackathon HealthTech Track
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          React + Node.js + MongoDB
        </span>
      </div>
    </div>
  );
}
