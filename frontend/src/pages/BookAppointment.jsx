import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookAppointment({ onMenuToggle }) {
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
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    doctorAPI.getAll().then(({ data }) => setDoctors(data)).finally(() => setDoctorsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    setSelectedSlot(''); setSlotsLoaded(false);
    appointmentAPI.getSlots(selectedDoctor._id, date)
      .then(({ data }) => { setBookedSlots(data.booked); setSlotsLoaded(true); });
  }, [selectedDoctor, date]);

  const showAlert = (msg, type = 'danger') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) return showAlert('Please complete all steps.', 'warning');
    setLoading(true);
    try {
      await appointmentAPI.book({ doctorId: selectedDoctor._id, date, timeSlot: selectedSlot });
      showAlert('Appointment booked successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Booking failed.');
    } finally { setLoading(false); }
  };

  const step = !selectedDoctor ? 1 : !date ? 2 : !slotsLoaded ? 2 : !selectedSlot ? 3 : 4;

  return (
    <div>
      <TopHeader
        title="Book Appointment"
        subtitle="Home / Book Appointment"
        onMenuToggle={onMenuToggle}
      />

      <div className="page-content">
        {alert && (
          <div className={`alert alert-${alert.type} fade-in`} role="alert">
            <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : alert.type === 'warning' ? 'exclamation-triangle' : 'x-circle'}-fill me-2`} />
            {alert.msg}
          </div>
        )}

        {/* Progress Steps */}
        <div className="card mb-4">
          <div className="card-body py-3">
            <div className="d-flex align-items-center gap-0">
              {['Select Doctor', 'Pick Date', 'Choose Slot', 'Confirm'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: step > i + 1 ? '#10b981' : step === i + 1 ? '#3b82f6' : 'var(--border)',
                      color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {step > i + 1 ? <i className="bi bi-check-lg" /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: step >= i + 1 ? 'var(--text)' : 'var(--text-muted)',
                    }}>{s}</span>
                  </div>
                  {i < 3 && (
                    <div style={{
                      flex: 1, height: 2, margin: '0 12px',
                      background: step > i + 1 ? '#10b981' : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4 book-grid">
          {/* Left */}
          <div className="col-lg-8">

            {/* Step 1 — Doctor */}
            <div className="card mb-4 fade-in">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div>
                  <div className="card-title-text">
                    <span style={{ color: 'var(--primary)', marginRight: 8 }}>01</span>
                    Select a Doctor
                  </div>
                  <div className="card-subtitle-text">Choose from available doctors</div>
                </div>
                {selectedDoctor && <span className="badge-status badge-available"><i className="bi bi-check-lg" /> Selected</span>}
              </div>
              <div className="card-body">
                {doctorsLoading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" style={{ width: 28, height: 28, borderWidth: 3 }} />
                  </div>
                ) : (
                  <div className="row g-3">
                    {doctors.map(doc => (
                      <div className="col-6 col-md-4" key={doc._id}>
                        <div
                          onClick={() => doc.isAvailable && setSelectedDoctor(doc)}
                          style={{
                            padding: '16px 14px',
                            borderRadius: 8,
                            border: `2px solid ${selectedDoctor?._id === doc._id ? '#3b82f6' : 'var(--border)'}`,
                            background: selectedDoctor?._id === doc._id ? 'rgba(59,130,246,0.06)' : 'var(--surface)',
                            cursor: doc.isAvailable ? 'pointer' : 'not-allowed',
                            opacity: doc.isAvailable ? 1 : 0.5,
                            transition: 'all 0.15s',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: selectedDoctor?._id === doc._id ? '#3b82f6' : 'var(--surface-2)',
                            color: selectedDoctor?._id === doc._id ? '#fff' : 'var(--primary)',
                            fontSize: 17, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px',
                            border: '2px solid var(--border)',
                          }}>
                            {doc.name[0]}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                            Dr. {doc.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                            {doc.specialization || 'General'}
                          </div>
                          <span className={`badge-status ${doc.isAvailable ? 'badge-available' : 'badge-busy'}`} style={{ fontSize: 10 }}>
                            <i className={`bi bi-circle-fill`} style={{ fontSize: 6 }} />
                            {doc.isAvailable ? ' Available' : ' Unavailable'}
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
              <div className="card mb-4 fade-in">
                <div className="card-header">
                  <div className="card-title-text">
                    <span style={{ color: 'var(--primary)', marginRight: 8 }}>02</span>
                    Select Date
                  </div>
                  <div className="card-subtitle-text">Pick your preferred appointment date</div>
                </div>
                <div className="card-body">
                  <div style={{ maxWidth: 260 }}>
                    <label className="form-label">Appointment Date</label>
                    <input type="date" className="form-control" min={today} value={date}
                      onChange={e => setDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Slots */}
            {slotsLoaded && (
              <div className="card fade-in">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <div>
                    <div className="card-title-text">
                      <span style={{ color: 'var(--primary)', marginRight: 8 }}>03</span>
                      Choose Time Slot
                    </div>
                    <div className="card-subtitle-text">
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{ALL_SLOTS.length - bookedSlots.length} available</span>
                      {' · '}
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{bookedSlots.length} booked</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {ALL_SLOTS.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`btn btn-sm ${isBooked ? 'btn-outline-secondary' : isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                          style={{
                            opacity: isBooked ? 0.4 : 1,
                            textDecoration: isBooked ? 'line-through' : 'none',
                            fontSize: 12, padding: '6px 14px',
                          }}
                        >
                          {isBooked && <i className="bi bi-lock-fill me-1" style={{ fontSize: 9 }} />}
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
          <div className="col-lg-4">
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="card-header">
                <div className="card-title-text">Booking Summary</div>
              </div>
              <div className="card-body">
                {[
                  { icon: 'bi-person-badge', label: 'Doctor', value: selectedDoctor ? `Dr. ${selectedDoctor.name}` : '—' },
                  { icon: 'bi-stethoscope', label: 'Specialization', value: selectedDoctor?.specialization || '—' },
                  { icon: 'bi-calendar3', label: 'Date', value: date || '—' },
                  { icon: 'bi-clock', label: 'Time Slot', value: selectedSlot || '—' },
                ].map(item => (
                  <div key={item.label} className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      <i className={`bi ${item.icon}`} />
                      {item.label}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}

                <div className="divider" />

                {selectedDoctor && date && selectedSlot && (
                  <div className="alert alert-success py-2 mb-3" style={{ fontSize: 12 }}>
                    <i className="bi bi-check-circle-fill me-2" />Ready to confirm
                  </div>
                )}

                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={handleBook}
                  disabled={loading || !selectedDoctor || !date || !selectedSlot}
                  style={{ padding: '10px' }}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Booking...</>
                    : <><i className="bi bi-check-lg me-2" />Confirm Appointment</>
                  }
                </button>

                <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/dashboard')}>
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
