import { appointmentAPI } from '../api/services';
import WaitingTimeBadge from './WaitingTimeBadge';

const STATUS_COLOR = {
  waiting: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
  'no-show': '#6b7280',
};

export default function AppointmentCard({ appointment, role, onUpdate, onError }) {
  const { _id, doctor, patient, date, timeSlot, status, queuePosition } = appointment;

  const handleStatusChange = async (newStatus) => {
    try {
      await appointmentAPI.updateStatus(_id, newStatus);
      onUpdate();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(_id);
      onUpdate();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Error cancelling');
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm('Mark this patient as no-show?')) return;
    try {
      await appointmentAPI.markNoShow(_id);
      onUpdate();
    } catch (err) {
      // fallback — mark as cancelled if no-show endpoint not ready yet
      await appointmentAPI.updateStatus(_id, 'cancelled');
      onUpdate();
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.left}>
          <span style={{ ...styles.badge, background: STATUS_COLOR[status] || '#6b7280' }}>
            {status.toUpperCase()}
          </span>
          {status === 'waiting' && (
            <span style={styles.queue}>Queue #{queuePosition}</span>
          )}
        </div>
        <span style={styles.time}>🕐 {timeSlot}</span>
      </div>

      <p style={styles.name}>
        {role === 'patient' ? `Dr. ${doctor?.name}` : `Patient: ${patient?.name}`}
      </p>
      {role === 'patient' && doctor?.specialization && (
        <p style={styles.spec}>{doctor.specialization}</p>
      )}
      <p style={styles.date}>📅 {date}</p>

      {/* Waiting time estimate for patient */}
      {role === 'patient' && status === 'waiting' && (
        <WaitingTimeBadge queuePosition={queuePosition} />
      )}

      {status === 'waiting' && (
        <div style={styles.actions}>
          {role === 'doctor' && (
            <>
              <button style={styles.completeBtn} onClick={() => handleStatusChange('completed')}>
                ✓ Complete
              </button>
              <button style={styles.noshowBtn} onClick={handleNoShow}>
                👻 No-Show
              </button>
            </>
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
    background: '#fff', borderRadius: 10, padding: '16px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 10,
    borderLeft: '4px solid #1a73e8',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: {
    color: '#fff', fontSize: 10, fontWeight: 700,
    padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5,
  },
  queue: { fontSize: 13, fontWeight: 700, color: '#1a73e8' },
  time: { fontSize: 13, color: '#555' },
  name: { fontWeight: 600, fontSize: 15, color: '#1a1a2e', margin: '4px 0' },
  spec: { fontSize: 12, color: '#888', margin: '2px 0' },
  date: { fontSize: 13, color: '#666', margin: '4px 0' },
  actions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  completeBtn: {
    background: '#10b981', color: '#fff', border: 'none',
    padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
  },
  noshowBtn: {
    background: '#6b7280', color: '#fff', border: 'none',
    padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
  },
  cancelBtn: {
    background: '#fff', color: '#ef4444', border: '1.5px solid #ef4444',
    padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
  },
};
