import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api/services';
import DoctorList from '../components/DoctorList';
import TimeSlotPicker from '../components/TimeSlotPicker';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getAll().then(({ data }) => setDoctors(data));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setSelectedSlot('');
    appointmentAPI.getSlots(selectedDoctor, date).then(({ data }) => {
      setSlots(data.available);
      setBookedSlots(data.booked);
    });
  }, [selectedDoctor, date]);

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) {
      setError('Please select a doctor, date, and time slot.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await appointmentAPI.book({ doctorId: selectedDoctor, date, timeSlot: selectedSlot });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Book an Appointment</h2>

      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.section}>
        <h3 style={styles.label}>1. Select a Doctor</h3>
        <DoctorList doctors={doctors} selectedId={selectedDoctor} onSelect={setSelectedDoctor} />
      </section>

      {selectedDoctor && (
        <section style={styles.section}>
          <h3 style={styles.label}>2. Pick a Date</h3>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.dateInput}
          />
        </section>
      )}

      {slots && (
        <section style={styles.section}>
          <h3 style={styles.label}>3. Choose a Time Slot</h3>
          <TimeSlotPicker
            slots={[...slots, ...bookedSlots]}
            bookedSlots={bookedSlots}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </section>
      )}

      {selectedSlot && (
        <button onClick={handleBook} style={styles.bookBtn} disabled={loading}>
          {loading ? 'Booking...' : `Confirm Booking — ${selectedSlot}`}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 28 },
  section: { marginBottom: 28 },
  label: { fontSize: 15, fontWeight: 700, color: '#444', marginBottom: 12 },
  dateInput: {
    padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none',
  },
  bookBtn: {
    background: '#1a73e8', color: '#fff', border: 'none',
    padding: '14px 28px', borderRadius: 8, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  success: {
    background: '#d1fae5', color: '#065f46', padding: '12px 16px',
    borderRadius: 8, marginBottom: 20, fontWeight: 600,
  },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
    borderRadius: 8, marginBottom: 20,
  },
};
