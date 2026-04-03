import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import Spinner from '../components/Spinner';

const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getAll()
      .then(({ data }) => setDoctors(data))
      .finally(() => setDoctorsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setSelectedSlot('');
    setSlotsLoaded(false);
    appointmentAPI.getSlots(selectedDoctor._id, date)
      .then(({ data }) => { setBookedSlots(data.booked); setSlotsLoaded(true); });
  }, [selectedDoctor, date]);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) {
      showAlert('Please complete all steps before confirming.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await appointmentAPI.book({ doctorId: selectedDoctor._id, date, timeSlot: selectedSlot });
      showAlert('Appointment booked successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const availableSlots = ALL_SLOTS.filter(s => !bookedSlots.includes(s));

  return (
    <div>
      <TopHeader title="Book Appointment" subtitle="Schedule a new appointment with a doctor" />

      <div className="page-body">
        {alert && (
          <div className={`alert alert-${alert.type} animate-fade`}>
            {alert.message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Left — Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Step 1 — Doctor */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Step 1 — Select Doctor</div>
                  <div className="card-subtitle">Choose an available doctor</div>
                </div>
                {selectedDoctor && (
                  <span className="badge badge-available">✓ Selected</span>
                )}
              </div>
              <div className="card-body">
                {doctorsLoading ? <Spinner text="Loading doctors..." /> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {doctors.map(doc => (
                      <div
                        key={doc._id}
                        onClick={() => doc.isAvailable && setSelectedDoctor(doc)}
                        style={{
                          padding: '14px',
                          borderRadius: 8,
                          border: `2px solid ${selectedDoctor?._id === doc._id ? '#2563eb' : '#e5e7eb'}`,
                          background: selectedDoctor?._id === doc._id ? '#eff6ff' : '#fff',
                          cursor: doc.isAvailable ? 'pointer' : 'not-allowed',
                          opacity: doc.isAvailable ? 1 : 0.5,
                          transition: 'all 0.15s',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: selectedDoctor?._id === doc._id ? '#2563eb' : '#e5e7eb',
                          color: selectedDoctor?._id === doc._id ? '#fff' : '#374151',
                          fontSize: 18, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 8px',
                        }}>
                          {doc.name[0]}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>Dr. {doc.name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{doc.specialization || 'General'}</div>
                        <div style={{ marginTop: 6 }}>
                          <span className={`badge ${doc.isAvailable ? 'badge-available' : 'badge-unavailable'}`}
                            style={{ fontSize: 10 }}>
                            {doc.isAvailable ? '● Available' : '● Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Date */}
            {selectedDoctor && (
              <div className="card animate-fade">
                <div className="card-header">
                  <div>
                    <div className="card-title">Step 2 — Select Date</div>
                    <div className="card-subtitle">Pick an appointment date</div>
                  </div>
                  {date && <span className="badge badge-available">✓ {date}</span>}
                </div>
                <div className="card-body">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Appointment Date</label>
                    <input type="date" className="form-input" min={today} value={date}
                      onChange={e => setDate(e.target.value)} style={{ maxWidth: 240 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Slots */}
            {slotsLoaded && (
              <div className="card animate-fade">
                <div className="card-header">
                  <div>
                    <div className="card-title">Step 3 — Choose Time Slot</div>
                    <div className="card-subtitle">
                      {availableSlots.length} slots available · {bookedSlots.length} booked
                    </div>
                  </div>
                  {selectedSlot && <span className="badge badge-available">✓ {selectedSlot}</span>}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_SLOTS.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`btn btn-sm ${isBooked ? '' : isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{
                            opacity: isBooked ? 0.4 : 1,
                            textDecoration: isBooked ? 'line-through' : 'none',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Summary */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-header">
              <div className="card-title">Booking Summary</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Doctor', value: selectedDoctor ? `Dr. ${selectedDoctor.name}` : '—' },
                  { label: 'Specialization', value: selectedDoctor?.specialization || '—' },
                  { label: 'Date', value: date || '—' },
                  { label: 'Time Slot', value: selectedSlot || '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</span>
                  </div>
                ))}

                <div className="divider" />

                {selectedDoctor && date && selectedSlot && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                    ✓ Ready to confirm your appointment
                  </div>
                )}

                <button
                  className="btn btn-primary w-full"
                  onClick={handleBook}
                  disabled={loading || !selectedDoctor || !date || !selectedSlot}
                >
                  {loading ? '⏳ Booking...' : '✓ Confirm Appointment'}
                </button>

                <button className="btn btn-ghost w-full" onClick={() => navigate('/dashboard')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
