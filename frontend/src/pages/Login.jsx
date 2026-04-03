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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input name="name" placeholder="Full Name" value={form.name}
                onChange={handleChange} style={styles.input} required />
              <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              {form.role === 'doctor' && (
                <input name="specialization" placeholder="Specialization (e.g. Cardiologist)"
                  value={form.specialization} onChange={handleChange} style={styles.input} />
              )}
            </>
          )}
          <input name="email" type="email" placeholder="Email" value={form.email}
            onChange={handleChange} style={styles.input} required />
          <input name="password" type="password" placeholder="Password" value={form.password}
            onChange={handleChange} style={styles.input} required />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={styles.link} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: {
    background: '#fff', borderRadius: 12, padding: 36,
    width: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: { textAlign: 'center', marginBottom: 24, color: '#1a1a2e' },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '10px 14px',
    borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  input: {
    width: '100%', padding: '10px 14px', marginBottom: 14,
    border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
  },
  btn: {
    width: '100%', padding: '12px', background: '#1a73e8', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  toggle: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#555' },
  link: { color: '#1a73e8', cursor: 'pointer', fontWeight: 600 },
};
