export default function StatsCard({ icon, label, value, color = '#1a73e8' }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconBox, background: color + '18', color }}>{icon}</div>
      <div>
        <p style={styles.value}>{value}</p>
        <p style={styles.label}>{label}</p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1, minWidth: 140,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 10, fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  value: { fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 },
  label: { fontSize: 12, color: '#888', margin: '2px 0 0', fontWeight: 500 },
};
