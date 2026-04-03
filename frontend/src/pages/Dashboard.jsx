import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import AppointmentCard from '../components/AppointmentCard';
import StatsCard from '../components/StatsCard';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import NotificationBanner from '../components/NotificationBanner';
import DoctorUtilization from '../components/DoctorUtilization';

const REFRESH_INTERVAL = 30000; // auto-refresh every 30 seconds

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = useCallback(async (silent = false) => {
    try {
      const { data } = await appointmentAPI.getMy();
      setAppointments(data);
      setLastRefresh(new Date());
      if (!silent) setLoading(false);
    } catch {
      if (!silent) {
        showToast('Failed to load appointments');
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchAppointments(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

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
  const cancelled = appointments.filter((a) => a.status !== 'waiting' && a.status !== 'completed');
  const isDoctor = user?.role === 'doctor';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {isDoctor ? '🩺 Doctor Dashboard' : '👤 My Appointments'}
          </h2>
          <p style={styles.sub}>
            Welcome back, {user?.name} &nbsp;·&nbsp;
            <span style={styles.refresh}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </p>
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

      {/* Notifications */}
      <NotificationBanner appointments={appointments} />

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatsCard icon="⏳" label="Waiting" value={waiting.length} color="#f59e0b" />
        <StatsCard icon="✅" label="Completed" value={completed.length} color="#10b981" />
        <StatsCard icon="✕" label="Cancelled" value={cancelled.length} color="#ef4444" />
        <StatsCard icon="📋" label="Total" value={appointments.length} color="#1a73e8" />
      </div>

      {/* Doctor utilization */}
      {isDoctor && <DoctorUtilization appointments={appointments} />}

      {/* Appointments */}
      {loading ? (
        <Spinner text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>📭</p>
          <p>No appointments yet.</p>
          {!isDoctor && (
            <Link to="/book" style={styles.emptyLink}>Book your first appointment →</Link>
          )}
        </div>
      ) : (
        <>
          {waiting.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>
                ⏳ Queue — Waiting ({waiting.length})
                <span style={styles.liveTag}>● LIVE</span>
              </h3>
              {waiting.map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={a}
                  role={user.role}
                  onUpdate={() => fetchAppointments(true)}
                  onError={(msg) => showToast(msg)}
                />
              ))}
            </section>
          )}
          {completed.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>✅ Completed ({completed.length})</h3>
              {completed.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role}
                  onUpdate={() => fetchAppointments(true)} onError={(msg) => showToast(msg)} />
              ))}
            </section>
          )}
          {cancelled.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>✕ Cancelled / No-Show ({cancelled.length})</h3>
              {cancelled.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role}
                  onUpdate={() => fetchAppointments(true)} onError={(msg) => showToast(msg)} />
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
  refresh: { fontSize: 12, color: '#aaa' },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  toggleBtn: {
    color: '#fff', border: 'none', padding: '10px 18px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  bookBtn: {
    background: '#1a73e8', color: '#fff', padding: '10px 18px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
  },
  statsRow: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: '#444',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
  },
  liveTag: {
    fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: 1,
  },
  empty: { textAlign: 'center', color: '#888', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyLink: { display: 'inline-block', marginTop: 12, color: '#1a73e8', fontWeight: 600 },
};
