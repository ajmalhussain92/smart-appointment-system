import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api/services';
import DoctorList from '../components/DoctorList';
import TimeSlotPicker from '../components/TimeSlotPicker';
import Toast from '../components/Toast';

const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getAll().then(({ data }) => setDoctors(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setSelectedSlot('');
    setSlotsLoaded(false);
    appointmentAPI.getSlots(selectedDoctor, date)
      .then(({ data }) => {
        setBookedSlots(data.booked);
        setSlotsLoaded(true);
      })
      .catch(console.error);
  }, [selectedDoctor, date]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) {
      showToast('Please select a doctor, date, and time slot.');
      return;
    }
    setLoading(true);
    try {
      await appointmentAPI.book({ doctorId: selectedDoctor, date, timeSlot: selectedSlot });
      showToast('Appointment booked successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Book an Appointment</h2>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <section style={styles.section}>
        <h3 style={styles.label}>1. Select a Doctor</h3>
        {doctors.length === 0
          ? <p style={styles.hint}>Loading doctors...</p>
          : <DoctorList doctors={doctors} selectedId={selectedDoctor} onSelect={(id) => { setSelectedDoctor(id); setDate(''); setSlotsLoaded(false); }} />
        }
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

      {slotsLoaded && (
        <section style={styles.section}>
          <h3 style={styles.label}>3. Choose a Time Slot</h3>
          <TimeSlotPicker
            slots={ALL_SLOTS}
            bookedSlots={bookedSlots}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </section>
      )}

      {selectedSlot && (
        <button onClick={handleBook} style={styles.bookBtn} disabled={loading}>
          {loading ? 'Booking...' : `✓ Confirm — ${selectedSlot} on ${date}`}
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
  hint: { color: '#888', fontSize: 14 },
  dateInput: {
    padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none',
  },
  bookBtn: {
    background: '#1a73e8', color: '#fff', border: 'none',
    padding: '14px 28px', borderRadius: 8, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
};
