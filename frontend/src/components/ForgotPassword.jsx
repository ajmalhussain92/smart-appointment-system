import { useState } from 'react';
import { authAPI } from '../api/services';

export default function ForgotPassword({ onClose }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpass, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authAPI.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally { setLoading(false); }
  };

  // Step 2 — Verify OTP (just move to step 3, actual verify on reset)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setError('');
    setStep(3);
  };

  // Step 3 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.');
    } finally { setLoading(false); }
  };

  const steps = ['Email', 'OTP', 'New Password'];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 14,
        padding: '28px 28px', width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.2s ease',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              {step === 4 ? 'Password Reset!' : 'Forgot Password'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {step === 1 && 'Enter your registered email'}
              {step === 2 && `OTP sent to ${email}`}
              {step === 3 && 'Set your new password'}
              {step === 4 && 'You can now sign in'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14,
          }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--border)',
                    color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}>
                    {step > i + 1 ? <i className="bi bi-check-lg" style={{ fontSize: 10 }} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: step >= i + 1 ? 'var(--text)' : 'var(--text-muted)' }}>{s}</span>
                </div>
                {i < 2 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 8px',
                    background: step > i + 1 ? 'var(--success)' : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 12 }}>
            <i className="bi bi-exclamation-triangle-fill me-2" />{error}
          </div>
        )}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control"
                placeholder="Enter your registered email"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              <i className="bi bi-info-circle me-1" />
              A 6-digit OTP will be sent to your email.
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</>
                : <><i className="bi bi-send-fill me-2" />Send OTP</>}
            </button>
            <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={onClose}>Cancel</button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input
                type="text" className="form-control"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} required autoFocus
                style={{ fontSize: 22, fontWeight: 700, letterSpacing: 8, textAlign: 'center' }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              <i className="bi bi-clock me-1" />
              OTP expires in 10 minutes.{' '}
              <span
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
              >
                Resend
              </span>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={otp.length !== 6}>
              <i className="bi bi-check-circle me-2" />Verify OTP
            </button>
            <button type="button" className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}>
              Back
            </button>
          </form>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                required autoFocus minLength={6} />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                : <><i className="bi bi-lock-fill me-2" />Reset Password</>}
            </button>
            <button type="button" className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => { setStep(2); setError(''); }}>
              Back
            </button>
          </form>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: 28, color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Password Reset Successfully!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              You can now sign in with your new password.
            </div>
            <button className="btn btn-primary w-100" onClick={onClose}>
              <i className="bi bi-box-arrow-in-right me-2" />Sign In Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
