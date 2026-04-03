import { useState } from 'react';

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call — backend will implement actual email
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      animation: 'fadeIn 0.2s ease',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: 14, padding: '32px 28px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              {sent ? 'Email Sent!' : 'Forgot Password?'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {sent ? 'Check your inbox' : 'Enter your registered email'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16,
          }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {sent ? (
          <div>
            <div style={{
              textAlign: 'center', padding: '20px 0',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--success-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <i className="bi bi-envelope-check-fill" style={{ fontSize: 24, color: 'var(--success)' }} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>
                Reset link sent to
              </div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
                Check your email and follow the instructions to reset your password.
              </div>
            </div>
            <button className="btn btn-primary w-100 mt-2" onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              <i className="bi bi-info-circle me-1" />
              We'll send a password reset link to this email address.
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                : <><i className="bi bi-send-fill me-2" />Send Reset Link</>
              }
            </button>
            <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={onClose}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
