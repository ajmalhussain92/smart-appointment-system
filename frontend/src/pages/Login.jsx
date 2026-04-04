import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ForgotPassword from '../components/ForgotPassword';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div style={S.page}>

        {/* ══ LEFT ══════════════════════════════════════════ */}
        <div style={S.left} className="d-none d-lg-block">

          {/* bg glow */}
          <div style={S.glow} />
          <div style={S.dots} />

          <div style={S.leftInner}>

            {/* Logo */}
            <div style={S.logo}>
              <div style={S.logoIcon}>
                <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <div style={S.logoName}>SmartDoc</div>
                <div style={S.logoSub}>Appointment Management System</div>
              </div>
            </div>

            {/* Heading */}
            <h1 style={S.heading}>
              Intelligent<br />
              <span style={{ color: '#60a5fa' }}>Healthcare</span><br />
              Scheduling
            </h1>

            <p style={S.desc}>
              Optimize scheduling, reduce waiting time, and improve
              operational efficiency with real-time queue management.
            </p>

            {/* Features */}
            <div style={S.features}>
              {[
                { icon: 'bi-lightning-charge-fill', text: 'Real-time queue updates every 30 seconds' },
                { icon: 'bi-bar-chart-fill',        text: 'Doctor utilization & performance tracking' },
                { icon: 'bi-bell-fill',             text: 'Smart no-show detection & alerts' },
                { icon: 'bi-shield-check',          text: 'Role-based access for doctors & patients' },
              ].map(f => (
                <div key={f.text} style={S.featureRow}>
                  <div style={S.featureIcon}>
                    <i className={`bi ${f.icon}`} style={{ color: '#60a5fa', fontSize: 15 }} />
                  </div>
                  <span style={S.featureText}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={S.stats}>
              {[
                { v: '5+', l: 'Doctors' },
                { v: '12', l: 'Slots' },
                { v: '30s', l: 'Refresh' },
                { v: '100%', l: 'Real-time' },
              ].map(s => (
                <div key={s.l} style={S.statItem}>
                  <div style={S.statVal}>{s.v}</div>
                  <div style={S.statLbl}>{s.l}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ══ RIGHT ═════════════════════════════════════════ */}
        <div style={S.right}>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} style={S.themeBtn}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}
              style={{ color: theme === 'dark' ? '#fbbf24' : '#6366f1' }} />
          </button>

          <div style={S.formWrap}>

            {/* Title */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={S.formTitle}>
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p style={S.formSub}>
                {isRegister ? 'Fill in the details to get started' : 'Sign in to your account to continue'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger fade-in mb-3" style={{ fontSize: 13 }}>
                <i className="bi bi-exclamation-triangle-fill me-2" />{error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-control" placeholder="Enter your full name"
                      value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                  {form.role === 'doctor' && (
                    <div className="mb-3">
                      <label className="form-label">Specialization</label>
                      <input name="specialization" className="form-control"
                        placeholder="e.g. Cardiologist, Neurologist"
                        value={form.specialization} onChange={handleChange} />
                    </div>
                  )}
                </>
              )}

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-control"
                  placeholder="Enter your email" value={form.email} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-control"
                  placeholder="Enter your password" value={form.password} onChange={handleChange} required />
              </div>

              {!isRegister && (
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <span style={S.forgotLink} onClick={() => setShowForgot(true)}>
                    Forgot password?
                  </span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100"
                style={{ padding: '11px', fontSize: 14 }} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Please wait...</>
                  : isRegister ? 'Create Account' : 'Sign In'
                }
              </button>
            </form>

            {/* Switch */}
            <p style={S.switchText}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span style={S.switchLink} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? 'Sign In' : 'Register'}
              </span>
            </p>

            {/* Demo credentials */}
            {!isRegister && (
              <div style={S.demo}>
                <div style={S.demoTitle}>Demo Credentials</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { role: 'Doctor',  email: 'ayesha@smartdoc.com', badge: 'badge-doctor' },
                    { role: 'Patient', email: 'ali@patient.com',     badge: 'badge-patient' },
                  ].map(d => (
                    <div key={d.email} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge-status ${d.badge}`} style={{ fontSize: 10 }}>{d.role}</span>
                      <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.email}</code>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Password: <strong style={{ color: 'var(--text)' }}>password123</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────── */
const S = {
  page: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--bg)',
  },

  /* Left */
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #0c1a2e 0%, #1a3a6e 55%, #1d4ed8 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  dots: {
    position: 'absolute', inset: 0, opacity: 0.04,
    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
    backgroundSize: '28px 28px',
  },
  glow: {
    position: 'absolute',
    width: 500, height: 500, borderRadius: '50%',
    background: 'rgba(59,130,246,0.18)',
    filter: 'blur(90px)',
    top: '10%', left: '20%',
    pointerEvents: 'none',
  },
  leftInner: {
    position: 'relative', zIndex: 1,
    padding: '48px 52px',
    width: '100%',
  },

  logo: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 },
  logoIcon: {
    width: 52, height: 52, background: '#3b82f6', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 24px rgba(59,130,246,0.5)',
    flexShrink: 0,
  },
  logoName: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 },
  logoSub:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  heading: {
    fontSize: 44, fontWeight: 900, color: '#fff',
    lineHeight: 1.1, marginBottom: 18, letterSpacing: -2,
  },
  desc: {
    fontSize: 15, color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.75, marginBottom: 40, maxWidth: 400,
  },

  features: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 44 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 38, height: 38, background: 'rgba(59,130,246,0.2)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 },

  stats: { display: 'flex', gap: 32 },
  statItem: { textAlign: 'center' },
  statVal: { fontSize: 26, fontWeight: 900, color: '#60a5fa', letterSpacing: -1 },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: 500 },

  /* Right */
  right: {
    width: '40%',
    minWidth: 380,
    background: 'var(--surface)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflowY: 'auto',
    padding: '40px 0',
  },
  themeBtn: {
    position: 'absolute', top: 16, right: 16,
  },
  formWrap: {
    width: '100%',
    maxWidth: 360,
    padding: '0 32px',
  },

  formTitle: { fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 5 },
  formSub:   { fontSize: 13, color: 'var(--text-muted)' },

  forgotLink: { fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 },

  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' },
  switchLink: { color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 },

  demo: {
    marginTop: 20, padding: '12px 14px',
    background: 'var(--surface-2)', borderRadius: 8,
    border: '1px solid var(--border)',
  },
  demoTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
};
