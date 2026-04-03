import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.brand}>🏥 SmartDoc</div>
          <h1 style={styles.tagline}>Intelligent Appointment Management</h1>
          <p style={styles.taglineSub}>
            Streamline your healthcare facility with smart scheduling, real-time queue management, and data-driven insights.
          </p>
          <div style={styles.features}>
            {[
              { icon: '⚡', text: 'Real-time queue updates' },
              { icon: '📊', text: 'Doctor utilization tracking' },
              { icon: '🔔', text: 'Smart notifications & alerts' },
              { icon: '📅', text: 'Intelligent slot management' },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={styles.formSub}>
              {isRegister ? 'Register to get started' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error animate-fade">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" className="form-input" placeholder="Enter your full name"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="role" className="form-input" value={form.role} onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                {form.role === 'doctor' && (
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input name="specialization" className="form-input"
                      placeholder="e.g. Cardiologist, Neurologist"
                      value={form.specialization} onChange={handleChange} />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input"
                placeholder="Enter your email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input"
                placeholder="Enter your password" value={form.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? '⏳ Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={styles.toggle}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span style={styles.toggleLink} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Sign In' : 'Register'}
            </span>
          </div>

          {!isRegister && (
            <div style={styles.demoBox}>
              <div style={styles.demoTitle}>Demo Credentials</div>
              <div style={styles.demoGrid}>
                <div style={styles.demoItem}>
                  <span className="badge badge-doctor">Doctor</span>
                  <span style={styles.demoEmail}>ayesha@smartdoc.com</span>
                </div>
                <div style={styles.demoItem}>
                  <span className="badge badge-patient">Patient</span>
                  <span style={styles.demoEmail}>ali@patient.com</span>
                </div>
              </div>
              <div style={styles.demoPass}>Password: <strong>password123</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px', position: 'relative', overflow: 'hidden',
  },
  leftContent: { maxWidth: 420, position: 'relative', zIndex: 1 },
  brand: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 32, letterSpacing: -0.5 },
  tagline: { fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: -1 },
  taglineSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 36 },
  features: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36, background: 'rgba(255,255,255,0.15)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
    flexShrink: 0,
  },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 },
  right: {
    width: 480, background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px',
  },
  formBox: { width: '100%', maxWidth: 380 },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: -0.5 },
  formSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' },
  toggleLink: { color: '#2563eb', cursor: 'pointer', fontWeight: 600 },
  demoBox: {
    marginTop: 24, padding: '14px 16px',
    background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
  },
  demoTitle: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  demoGrid: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 },
  demoItem: { display: 'flex', alignItems: 'center', gap: 8 },
  demoEmail: { fontSize: 12, color: '#374151', fontFamily: 'monospace' },
  demoPass: { fontSize: 12, color: '#6b7280' },
};
