import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: 'bi-lightning-charge-fill', color: '#f59e0b', bg: '#fffbeb', title: 'Real-time Queue',    desc: 'Live queue position and estimated waiting time. Auto-refreshes every 30 seconds.' },
  { icon: 'bi-bar-chart-line-fill',   color: '#3b82f6', bg: '#eff6ff', title: 'Doctor Analytics',   desc: 'Track utilization rates, completion stats, and workload distribution per doctor.' },
  { icon: 'bi-bell-fill',             color: '#8b5cf6', bg: '#f5f3ff', title: 'Email Reminders',    desc: 'Automatic appointment reminders sent 60 minutes before your scheduled slot.' },
  { icon: 'bi-calendar-check-fill',   color: '#10b981', bg: '#ecfdf5', title: 'Smart Scheduling',   desc: 'Prevent double booking with intelligent conflict detection and slot locking.' },
  { icon: 'bi-camera-video-fill',     color: '#ef4444', bg: '#fef2f2', title: 'Online & In-Person', desc: 'Book in-person or online consultations. Doctors can set off-days with online fallback.' },
  { icon: 'bi-shield-lock-fill',      color: '#6366f1', bg: '#eef2ff', title: 'Role-based Access',  desc: 'Separate secure dashboards for doctors and patients with JWT authentication.' },
];

const STATS = [
  { value: '12',   label: 'Time Slots/Day',  icon: 'bi-clock-fill',         color: '#3b82f6' },
  { value: '60s',  label: 'Reminder Alert',  icon: 'bi-bell-fill',          color: '#8b5cf6' },
  { value: '100%', label: 'Real-time',       icon: 'bi-lightning-fill',     color: '#f59e0b' },
  { value: '2',    label: 'Roles Supported', icon: 'bi-people-fill',        color: '#10b981' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register',        desc: 'Create your account as a doctor or patient in seconds.',         icon: 'bi-person-plus-fill',      color: '#3b82f6' },
  { step: '02', title: 'Find a Doctor',   desc: 'Browse available doctors, filter by specialization or type.',    icon: 'bi-search-heart-fill',     color: '#8b5cf6' },
  { step: '03', title: 'Book a Slot',     desc: 'Pick a date and time slot. See real-time availability.',         icon: 'bi-calendar-plus-fill',    color: '#10b981' },
  { step: '04', title: 'Get Reminded',    desc: 'Receive an email reminder 60 minutes before your appointment.',  icon: 'bi-envelope-check-fill',   color: '#f59e0b' },
];

export default function Home() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: 62 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}>
              <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.4, lineHeight: 1 }}>SmartDoc</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Appointment System</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggle} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 15,
              color: theme === 'dark' ? '#fbbf24' : '#6366f1',
              transition: 'all 0.2s',
            }}>
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
            </button>
            <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary btn-sm" style={{ fontSize: 13, padding: '7px 18px' }}>
              {user ? 'Dashboard' : 'Sign In'}
              <i className="bi bi-arrow-right ms-2" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '72px 40px 64px', textAlign: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
          padding: '5px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          marginBottom: 24, border: '1px solid rgba(59,130,246,0.2)', letterSpacing: 0.3,
        }}>
          <i className="bi bi-trophy-fill" style={{ fontSize: 10 }} />
          HACKATHON PROJECT — HEALTHTECH TRACK
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -2.5, marginBottom: 20, color: 'var(--text)' }}>
          Smart Appointment<br />
          <span style={{ color: '#3b82f6' }}>Scheduling System</span>
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}>
          An intelligent appointment management system that optimizes scheduling,
          reduces patient waiting time, and improves operational efficiency in healthcare.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            <i className="bi bi-arrow-right-circle-fill me-2" />
            {user ? 'Open Dashboard' : 'Get Started Free'}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-outline-secondary" style={{ padding: '12px 32px', fontSize: 15 }}>
              <i className="bi bi-play-circle me-2" />
              View Demo
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', maxWidth: 640, margin: '0 auto', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--surface-2)' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex: '1 1 140px', padding: '20px 16px', textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18, display: 'block', marginBottom: 6 }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '64px 40px', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: -1, marginBottom: 12 }}>Everything you need</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>Built for real healthcare workflows — not just a demo.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '28px 28px',
              transition: 'all 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: 20 }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '64px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: -1 }}>Up and running in 4 steps</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {HOW_IT_WORKS.map((h, i) => (
            <div key={h.step} style={{ textAlign: 'center', padding: '8px 16px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: h.color + '15', border: `2px solid ${h.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${h.icon}`} style={{ color: h.color, fontSize: 24 }} />
                </div>
                <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: h.color, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{h.step}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{h.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '64px 40px', background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.8 }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
          Register as a doctor or patient and experience smart scheduling today.
        </p>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff', color: '#1d4ed8',
          padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
          textDecoration: 'none', transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
        >
          <i className="bi bi-person-plus-fill" />
          Create Account
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 11 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>SmartDoc</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 — Built for Hackathon HealthTech Track</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['React', 'Node.js', 'MongoDB', 'Socket.io'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </footer>

    </div>
  );
}
