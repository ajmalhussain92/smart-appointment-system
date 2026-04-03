import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>

      {/* ── Left Panel ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
        className="d-none d-lg-flex"
      >
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <div style={{
              width: 52, height: 52, background: '#3b82f6', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(59,130,246,0.45)',
            }}>
              <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 26 }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>SmartDoc</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Appointment Management System</div>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.12, marginBottom: 18, letterSpacing: -2 }}>
            Intelligent<br />
            <span style={{ color: '#60a5fa' }}>Healthcare</span><br />
            Scheduling
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 44 }}>
            Optimize scheduling, reduce waiting time, and improve operational efficiency with real-time queue management.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { icon: 'bi-lightning-charge-fill', text: 'Real-time queue updates every 30 seconds' },
              { icon: 'bi-bar-chart-fill',        text: 'Doctor utilization & performance tracking' },
              { icon: 'bi-bell-fill',             text: 'Smart no-show detection & alerts' },
              { icon: 'bi-shield-check',          text: 'Role-based access for doctors & patients' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 38, height: 38, background: 'rgba(59,130,246,0.2)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`bi ${f.icon}`} style={{ color: '#60a5fa', fontSize: 17 }} />
                </div>
                <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width: '460px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 44px',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        position: 'relative',
        overflowY: 'auto',
      }}>

        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button className="theme-toggle" onClick={toggle}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}
              style={{ color: theme === 'dark' ? '#fbbf24' : '#6366f1' }} />
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 5 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isRegister ? 'Fill in the details to get started' : 'Sign in to your account to continue'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger fade-in mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />{error}
          </div>
        )}

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

          <button type="submit" className="btn btn-primary w-100 mt-1"
            style={{ padding: '10px', fontSize: 14 }} disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Please wait...</>
              : isRegister ? 'Create Account' : 'Sign In'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>

        {!isRegister && (
          <div style={{
            marginTop: 20, padding: '12px 14px',
            background: 'var(--surface-2)', borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Demo Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { role: 'Doctor', email: 'ayesha@smartdoc.com', badge: 'badge-doctor' },
                { role: 'Patient', email: 'ali@patient.com', badge: 'badge-patient' },
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
  );
}
