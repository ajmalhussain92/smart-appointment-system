export default function Toast({ message, type = 'error' }) {
  const bg = type === 'success' ? '#d1fae5' : type === 'info' ? '#dbeafe' : '#fee2e2';
  const color = type === 'success' ? '#065f46' : type === 'info' ? '#1e40af' : '#dc2626';
  const icon = type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '✕';

  return (
    <div style={{ ...styles.toast, background: bg, color }}>
      <span style={styles.icon}>{icon}</span>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px', borderRadius: 8, marginBottom: 20,
    fontWeight: 500, fontSize: 14, animation: 'fadeIn 0.2s ease',
  },
  icon: { fontWeight: 700, fontSize: 16 },
};
