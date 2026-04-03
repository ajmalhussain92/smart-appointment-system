import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import AppointmentCard from '../components/AppointmentCard';
import StatsCard from '../components/StatsCard';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await appointmentAPI.getMy();
      setAppointments(data);
    } catch {
      showToast('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleToggleAvailability = async () => {
    try {
      const { data } = await doctorAPI.toggleAvailability();
      setIsAvailable(data.isAvailable);
      showToast(
        data.isAvailable ? 'You are now available' : 'You are now unavailable',
        'info'
      );
    } catch {
      showToast('Failed to update availability');
    }
  };

  const waiting = appointments.filter((a) => a.status === 'waiting');
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  const isDoctor = user?.role === 'doctor';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {isDoctor ? '🩺 Doctor Dashboard' : '👤 My Appointments'}
          </h2>
          <p style={styles.sub}>Welcome back, {user?.name}</p>
        </div>
        <div style={styles.headerActions}>
          {isDoctor && (
            <button
              onClick={handleToggleAvailability}
              style={{ ...styles.toggleBtn, background: isAvailable ? '#10b981' : '#ef4444' }}
            >
              {isAvailable ? '● Available' : '● Unavailable'}
            </button>
          )}
          {!isDoctor && (
            <Link to="/book" style={styles.bookBtn}>+ Book Appointment</Link>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatsCard icon="⏳" label="Waiting" value={waiting.length} color="#f59e0b" />
        <StatsCard icon="✅" label="Completed" value={completed.length} color="#10b981" />
        <StatsCard icon="✕" label="Cancelled" value={cancelled.length} color="#ef4444" />
        <StatsCard icon="📋" label="Total" value={appointments.length} color="#1a73e8" />
      </div>

      {/* Appointments */}
      {loading ? (
        <Spinner text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>📭</p>
          <p>No appointments yet.</p>
          {!isDoctor && <Link to="/book" style={styles.emptyLink}>Book your first appointment →</Link>}
        </div>
      ) : (
        <>
          {waiting.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>⏳ Queue — Waiting ({waiting.length})</h3>
              {waiting.map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={a}
                  role={user.role}
                  onUpdate={fetchAppointments}
                  onError={(msg) => showToast(msg)}
                />
              ))}
            </section>
          )}
          {completed.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>✅ Completed ({completed.length})</h3>
              {completed.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role} onUpdate={fetchAppointments} onError={(msg) => showToast(msg)} />
              ))}
            </section>
          )}
          {cancelled.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>✕ Cancelled ({cancelled.length})</h3>
              {cancelled.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role} onUpdate={fetchAppointments} onError={(msg) => showToast(msg)} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 760, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  sub: { color: '#666', marginTop: 4, fontSize: 14 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  toggleBtn: {
    color: '#fff', border: 'none', padding: '10px 18px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  bookBtn: {
    background: '#1a73e8', color: '#fff', padding: '10px 18px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
  },
  statsRow: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#444', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#888', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyLink: { display: 'inline-block', marginTop: 12, color: '#1a73e8', fontWeight: 600 },
};
