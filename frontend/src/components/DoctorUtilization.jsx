export default function DoctorUtilization({ appointments }) {
  if (!appointments?.length) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const waiting = todayAppts.filter((a) => a.status === 'waiting').length;
  const completed = todayAppts.filter((a) => a.status === 'completed').length;
  const total = todayAppts.length;
  const utilization = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgPerHour = completed > 0 ? (completed / 8).toFixed(1) : 0;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>📊 Today's Utilization</h3>
      <div style={styles.row}>
        <div style={styles.stat}>
          <span style={styles.value}>{total}</span>
          <span style={styles.label}>Total Today</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.value}>{waiting}</span>
          <span style={styles.label}>In Queue</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.value}>{completed}</span>
          <span style={styles.label}>Completed</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.value, color: utilization > 70 ? '#10b981' : '#f59e0b' }}>
            {utilization}%
          </span>
          <span style={styles.label}>Utilization</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${utilization}%`, background: utilization > 70 ? '#10b981' : '#f59e0b' }} />
      </div>

      <p style={styles.hint}>
        {waiting > 5
          ? '⚠️ High queue — consider extending hours'
          : waiting > 0
          ? `✅ ${waiting} patient(s) waiting — avg ~${avgPerHour} patients/hr`
          : '🎉 Queue is clear!'}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 24,
  },
  title: { fontSize: 15, fontWeight: 700, color: '#444', marginBottom: 16 },
  row: { display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 },
  value: { fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  label: { fontSize: 11, color: '#888', marginTop: 2, fontWeight: 500 },
  barBg: { height: 8, background: '#f3f4f6', borderRadius: 4, marginBottom: 12 },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  hint: { fontSize: 13, color: '#666', margin: 0 },
};
