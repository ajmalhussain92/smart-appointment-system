import { appointmentAPI } from '../api/services';

const STATUS_COLOR = {
  waiting: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export default function AppointmentCard({ appointment, role, onUpdate }) {
  const { _id, doctor, patient, date, timeSlot, status, queuePosition } = appointment;

  const handleStatusChange = async (newStatus) => {
    try {
      await appointmentAPI.updateStatus(_id, newStatus);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(_id);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.badge, background: STATUS_COLOR[status] }}>
          {status.toUpperCase()}
        </span>
        {status === 'waiting' && (
          <span style={styles.queue}>Queue #{queuePosition}</span>
        )}
      </div>
      <p style={styles.info}>
        {role === 'patient' ? `Dr. ${doctor?.name}` : `Patient: ${patient?.name}`}
      </p>
      {role === 'patient' && doctor?.specialization && (
        <p style={styles.sub}>{doctor.specialization}</p>
      )}
      <p style={styles.info}>📅 {date} &nbsp; 🕐 {timeSlot}</p>

      {status === 'waiting' && (
        <div style={styles.actions}>
          {role === 'doctor' && (
            <button style={styles.completeBtn} onClick={() => handleStatusChange('completed')}>
              ✓ Complete
            </button>
          )}
          <button style={styles.cancelBtn} onClick={handleCancel}>
            ✕ Cancel
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 10, padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 12,
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  badge: {
    color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
  },
  queue: { fontSize: 13, fontWeight: 600, color: '#1a73e8' },
  info: { margin: '4px 0', fontSize: 14, color: '#333' },
  sub: { margin: '2px 0', fontSize: 12, color: '#888' },
  actions: { display: 'flex', gap: 8, marginTop: 10 },
  completeBtn: {
    background: '#10b981', color: '#fff', border: 'none',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
  },
  cancelBtn: {
    background: '#ef4444', color: '#fff', border: 'none',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
  },
};
