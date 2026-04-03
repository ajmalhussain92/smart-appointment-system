export default function Preloader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      transition: 'opacity 0.3s',
    }}>
      <div style={{
        width: 56, height: 56,
        background: '#3b82f6',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        animation: 'preloaderPulse 1.2s ease-in-out infinite',
      }}>
        <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: 26 }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>
        SmartDoc
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
        Appointment Management System
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#3b82f6',
            animation: `preloaderDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes preloaderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(59,130,246,0); }
        }
        @keyframes preloaderDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
