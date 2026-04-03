import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import AppointmentCard from '../components/AppointmentCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await appointmentAPI.getMy();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleToggleAvailability = async () => {
    try {
      const { data } = await doctorAPI.toggleAvailability();
      setIsAvailable(data.isAvailable);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const waiting = appointments.filter((a) => a.status === 'waiting');
  const others = appointments.filter((a) => a.status !== 'waiting');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {user?.role === 'doctor' ? '🩺 Doctor Dashboard' : '👤 My Appointments'}
          </h2>
          <p style={styles.sub}>Welcome, {user?.name}</p>
        </div>
        {user?.role === 'doctor' && (
          <button
            onClick={handleToggleAvailability}
            style={{ ...styles.toggleBtn, background: isAvailable ? '#10b981' : '#ef4444' }}
          >
            {isAvailable ? '● Available' : '● Unavailable'}
          </button>
        )}
      </div>

      {loading ? (
        <p style={styles.loading}>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <div style={styles.empty}>
          <p>No appointments yet.</p>
        </div>
      ) : (
        <>
          {waiting.length > 0 && (
            <section>
              <h3 style={styles.sectionTitle}>⏳ Waiting ({waiting.length})</h3>
              {waiting.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role} onUpdate={fetchAppointments} />
              ))}
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h3 style={styles.sectionTitle}>📋 History</h3>
              {others.map((a) => (
                <AppointmentCard key={a._id} appointment={a} role={user.role} onUpdate={fetchAppointments} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  sub: { color: '#666', marginTop: 4 },
  toggleBtn: {
    color: '#fff', border: 'none', padding: '10px 20px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  loading: { textAlign: 'center', color: '#888', marginTop: 40 },
  empty: { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#444', marginBottom: 12 },
};
