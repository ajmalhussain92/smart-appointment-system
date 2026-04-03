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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* Left — Branding */}
      <div style={{
        flex: 1, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }} className="d-none d-lg-flex">

        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative', maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44, background: '#3b82f6', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bi bi-hospital-fill text-white" style={{ fontSize: 22 }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>SmartDoc</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Appointment Management System</div>
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16, letterSpacing: -1.5 }}>
            Intelligent<br />
            <span style={{ color: '#60a5fa' }}>Healthcare</span><br />
            Scheduling
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 40 }}>
            Optimize scheduling, reduce waiting time, and improve operational efficiency with real-time queue management.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: 'bi-lightning-charge-fill', text: 'Real-time queue updates every 30 seconds' },
              { icon: 'bi-bar-chart-fill', text: 'Doctor utilization & performance tracking' },
              { icon: 'bi-bell-fill', text: 'Smart no-show detection & alerts' },
              { icon: 'bi-shield-check', text: 'Role-based access for doctors & patients' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, background: 'rgba(59,130,246,0.2)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`bi ${f.icon}`} style={{ color: '#60a5fa', fontSize: 15 }} />
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 48px', background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
      }}>

        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button className="theme-toggle" onClick={toggle}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
          </button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
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

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-control"
              placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-100" style={{ padding: '11px', fontSize: 14 }} disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Please wait...</>
              : isRegister ? 'Create Account' : 'Sign In'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>

        {!isRegister && (
          <div style={{
            marginTop: 24, padding: '14px 16px',
            background: 'var(--surface-2)', borderRadius: 8,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Demo Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { role: 'Doctor', email: 'ayesha@smartdoc.com', badge: 'badge-doctor' },
                { role: 'Patient', email: 'ali@patient.com', badge: 'badge-patient' },
              ].map(d => (
                <div key={d.email} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge-status ${d.badge}`} style={{ fontSize: 10 }}>{d.role}</span>
                  <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.email}</code>
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
