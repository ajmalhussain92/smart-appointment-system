export default function DoctorList({ doctors, selectedId, onSelect }) {
  return (
    <div style={styles.grid}>
      {doctors.map((doc) => (
        <div
          key={doc._id}
          onClick={() => doc.isAvailable && onSelect(doc._id)}
          style={{
            ...styles.card,
            border: selectedId === doc._id ? '2px solid #1a73e8' : '2px solid #e5e7eb',
            opacity: doc.isAvailable ? 1 : 0.5,
            cursor: doc.isAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          <div style={styles.avatar}>{doc.name[0]}</div>
          <p style={styles.name}>Dr. {doc.name}</p>
          <p style={styles.spec}>{doc.specialization || 'General'}</p>
          <span style={{ ...styles.status, color: doc.isAvailable ? '#10b981' : '#ef4444' }}>
            {doc.isAvailable ? '● Available' : '● Unavailable'}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  card: {
    background: '#fff', borderRadius: 10, padding: 16,
    textAlign: 'center', width: 140, transition: 'border 0.2s',
  },
  avatar: {
    width: 48, height: 48, borderRadius: '50%', background: '#1a73e8',
    color: '#fff', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
  },
  name: { margin: '4px 0', fontWeight: 600, fontSize: 14 },
  spec: { margin: '2px 0', fontSize: 12, color: '#888' },
  status: { fontSize: 12, fontWeight: 600 },
};
