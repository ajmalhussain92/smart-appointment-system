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
  const [showPassword, setShowPassword] = useState(false);
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
      <style>{`
        @media (max-width: 991px) {
          .login-page { flex-direction: column !important; }
          .login-left { display: none !important; }
          .login-right { width: 100% !important; height: 100vh !important; border-left: none !important; }
          .login-form-wrap { padding: 0 20px !important; max-width: 100% !important; margin: 0 !important; }
        }
        @media (min-width: 992px) {
          .login-page { flex-direction: row !important; }
          .login-left { width: 60% !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .login-right { width: 40% !important; border-left: 1px solid var(--border) !important; }
          .login-form-wrap { padding: 0 32px !important; max-width: 360px !important; }
        }
      `}</style>

      <div className="login-page" style={S.page}>
        {/* ══ 60% LEFT PANEL (10% gap + 40% content full width + 10% gap) ════════ */}
        <div className="login-left" style={{...S.left, background: theme === 'dark' ? 'linear-gradient(145deg, #0c1a2e 0%, #1a3a6e 55%, #1d4ed8 100%)' : 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 55%, #a5b4fc 100%)'}} onClick={toggle}>
          <div style={S.glow} />
          <div style={S.dots} />

          <div style={S.leftInner}>
            {/* Logo */}
            <div style={S.logo}>
              <div style={S.logoIcon}>
                <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <div>
                <div style={S.logoName}>SmartDoc</div>
                <div style={S.logoSub}>Appointment Management System</div>
              </div>
            </div>

            {/* Heading */}
            <h1 style={{...S.heading, color: theme === 'dark' ? '#fff' : '#1e293b'}}>
              Intelligent<br />
              <span style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}>Healthcare</span><br />
              Scheduling
            </h1>

            <p style={{...S.desc, color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.7)'}}>
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
                    <i className={`bi ${f.icon}`} style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6', fontSize: 16 }} />
                  </div>
                  <span style={{...S.featureText, color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.9)'}}>{f.text}</span>
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
                  <div style={{...S.statVal, color: theme === 'dark' ? '#60a5fa' : '#3b82f6'}}>{s.v}</div>
                  <div style={{...S.statLbl, color: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.5)'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 40% RIGHT PANEL (background full) ════════ */}
        <div className="login-right" style={S.right}>
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} style={S.themeBtn}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}
              style={{ color: theme === 'dark' ? '#fbbf24' : '#6366f1' }} />
          </button>

          <div className="login-form-wrap" style={S.formWrap}>
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

              <div className="mb-3" style={{ position: 'relative' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} className="form-control"
                    placeholder="Enter your password" value={form.password} onChange={handleChange} required
                    style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 16, padding: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                  </button>
                </div>
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
                    { role: 'Doctor',  email: 'doctor1@smartdoc.com', badge: 'badge-doctor' },
                    { role: 'Patient', email: 'patient1@smartdoc.com',     badge: 'badge-patient' },
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
    width: '100%',
    overflow: 'hidden',
    background: 'var(--bg)',
  },

  /* Left */
  left: {
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
    width: '66.67%',
    padding: '32px 40px',
  },

  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoIcon: {
    width: 48, height: 48, background: '#3b82f6', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
    flexShrink: 0,
  },
  logoName: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 },
  logoSub:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 },

  heading: {
    fontSize: 48, fontWeight: 900,
    lineHeight: 1.05, marginBottom: 14, letterSpacing: -2,
  },
  desc: {
    fontSize: 14,
    lineHeight: 1.6, marginBottom: 24, maxWidth: 460,
  },

  features: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36, background: 'rgba(59,130,246,0.2)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { fontSize: 13, fontWeight: 500 },

  stats: { display: 'flex', gap: 28 },
  statItem: { textAlign: 'center', minWidth: 60 },
  statVal: { fontSize: 26, fontWeight: 900, letterSpacing: -1 },
  statLbl: { fontSize: 10, marginTop: 2, fontWeight: 500 },

  /* Right */
  right: {
    flexShrink: 0,
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
