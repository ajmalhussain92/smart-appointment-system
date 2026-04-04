import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

const ALL_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [apptType, setApptType] = useState('in-person');
  const [waitingTime, setWaitingTime] = useState(null);
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
    setSelectedSlot(''); setSlotsLoaded(false); setWaitingTime(null);

    // Check off days
    if (selectedDoctor.offDays?.includes(date)) {
      setAlert({ msg: 'Doctor is not available on this date (off day).', type: 'warning' });
      return;
    }

    Promise.all([
      appointmentAPI.getSlots(selectedDoctor._id, date),
      appointmentAPI.getWaitingTime(selectedDoctor._id, date),
    ]).then(([slotsRes, waitRes]) => {
      setAvailableSlots(slotsRes.data.available || []);
      setBookedSlots(slotsRes.data.booked || []);
      setWaitingTime(waitRes.data);
      setSlotsLoaded(true);
    }).catch(console.error);
  }, [selectedDoctor, date]);

  const showAlert = (msg, type = 'danger') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) return showAlert('Please complete all steps.', 'warning');
    setLoading(true);
    try {
      const res = await appointmentAPI.book({ doctorId: selectedDoctor._id, date, timeSlot: selectedSlot, type: apptType });
      showAlert(`Appointment booked! Queue position: #${res.data.queuePosition}`, 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Booking failed.');
    } finally { setLoading(false); }
  };

  const step = !selectedDoctor ? 1 : !date ? 2 : !slotsLoaded ? 2 : !selectedSlot ? 3 : 4;

  return (
    <div>
      <TopHeader title="Book Appointment" subtitle="Home / Book Appointment" />
      <div className="page-content">

        {alert && (
          <div className={`alert alert-${alert.type} fade-in`}>
            <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : alert.type === 'warning' ? 'exclamation-triangle' : 'x-circle'}-fill me-2`} />
            {alert.msg}
          </div>
        )}

        {/* Progress */}
        <div className="card mb-2">
          <div className="card-body py-3">
            <div className="d-flex align-items-center">
              {['Select Doctor', 'Pick Date', 'Choose Slot', 'Confirm'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--border)',
                      color: step >= i + 1 ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
                    }}>
                      {step > i + 1 ? <i className="bi bi-check-lg" style={{ fontSize: 11 }} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: step >= i + 1 ? 'var(--text)' : 'var(--text-muted)' }}>{s}</span>
                  </div>
                  {i < 3 && <div style={{ flex: 1, height: 2, margin: '0 10px', background: step > i + 1 ? 'var(--success)' : 'var(--border)', transition: 'background 0.3s' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-lg-8">

            {/* Step 1 — Doctor */}
            <div className="card mb-2 fade-in">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div>
                  <div className="card-title-text"><span style={{ color: 'var(--primary)', marginRight: 8 }}>01</span>Select Doctor</div>
                  <div className="card-subtitle-text">Choose from available doctors</div>
                </div>
                {selectedDoctor && <span className="badge-status badge-available"><i className="bi bi-check-lg" /> Selected</span>}
              </div>
              <div className="card-body">
                {doctorsLoading ? (
                  <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                  </div>
                ) : (
                  <div className="row g-2">
                    {doctors.map(doc => (
                      <div className="col-6 col-md-4" key={doc._id}>
                        <div onClick={() => doc.isAvailable && setSelectedDoctor(doc)} style={{
                          padding: '14px 12px', borderRadius: 8, textAlign: 'center', cursor: doc.isAvailable ? 'pointer' : 'not-allowed',
                          border: `2px solid ${selectedDoctor?._id === doc._id ? 'var(--primary)' : 'var(--border)'}`,
                          background: selectedDoctor?._id === doc._id ? 'var(--primary-light)' : 'var(--surface)',
                          opacity: doc.isAvailable ? 1 : 0.5, transition: 'all 0.15s',
                        }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                            background: selectedDoctor?._id === doc._id ? 'var(--primary)' : 'var(--surface-2)',
                            color: selectedDoctor?._id === doc._id ? '#fff' : 'var(--primary)',
                            fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--border)',
                          }}>{doc.name[0]}</div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>Dr. {doc.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{doc.specialization || 'General'}</div>
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            {(doc.consultationType || ['in-person']).map(t => (
                              <span key={t} style={{
                                fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                                background: t === 'online' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                                color: t === 'online' ? '#6366f1' : '#059669',
                              }}>
                                <i className={`bi ${t === 'online' ? 'bi-camera-video-fill' : 'bi-hospital-fill'} me-1`} style={{ fontSize: 8 }} />
                                {t === 'online' ? 'Online' : 'In-Person'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Date + Type */}
            {selectedDoctor && (
              <div className="card mb-2 fade-in">
                <div className="card-header">
                  <div className="card-title-text"><span style={{ color: 'var(--primary)', marginRight: 8 }}>02</span>Select Date & Type</div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Appointment Date</label>
                      <input type="date" className="form-control" min={today} value={date}
                        onChange={e => { setDate(e.target.value); setAlert(null); }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Appointment Type</label>
                      <div className="d-flex gap-2">
                        {(selectedDoctor.consultationType || ['in-person']).map(t => (
                          <button key={t} type="button"
                            className={`btn btn-sm flex-fill ${apptType === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setApptType(t)}>
                            <i className={`bi ${t === 'online' ? 'bi-camera-video-fill' : 'bi-hospital-fill'} me-1`} />
                            {t === 'online' ? 'Online' : 'In-Person'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Slots */}
            {slotsLoaded && (
              <div className="card fade-in">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <div>
                    <div className="card-title-text"><span style={{ color: 'var(--primary)', marginRight: 8 }}>03</span>Choose Time Slot</div>
                    <div className="card-subtitle-text">
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{availableSlots.length} available</span>
                      {' · '}
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{bookedSlots.length} booked</span>
                      {waitingTime && (
                        <span style={{ marginLeft: 8, color: 'var(--warning)', fontWeight: 600 }}>
                          <i className="bi bi-hourglass-split me-1" />~{waitingTime.estimatedMinutes}m avg wait
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {availableSlots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                      <i className="bi bi-calendar-x-fill" style={{ fontSize: 28, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                      No slots available for this date
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {ALL_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isAvail = availableSlots.includes(slot);
                        const isSelected = selectedSlot === slot;
                        if (!isAvail && !isBooked) return null;
                        return (
                          <button key={slot} disabled={isBooked} onClick={() => setSelectedSlot(slot)}
                            className={`btn btn-sm ${isBooked ? 'btn-outline-secondary' : isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                            style={{ opacity: isBooked ? 0.4 : 1, textDecoration: isBooked ? 'line-through' : 'none', fontSize: 12, padding: '6px 14px' }}>
                            {isBooked && <i className="bi bi-lock-fill me-1" style={{ fontSize: 9 }} />}
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="col-lg-4">
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="card-header">
                <div className="card-title-text">Booking Summary</div>
              </div>
              <div className="card-body">
                {[
                  { icon: 'bi-person-badge', label: 'Doctor',         value: selectedDoctor ? `Dr. ${selectedDoctor.name}` : '—' },
                  { icon: 'bi-award',        label: 'Specialization', value: selectedDoctor?.specialization || '—' },
                  { icon: 'bi-calendar3',    label: 'Date',           value: date || '—' },
                  { icon: 'bi-clock',        label: 'Time Slot',      value: selectedSlot || '—' },
                  { icon: 'bi-hospital',     label: 'Type',           value: apptType === 'online' ? '🎥 Online' : '🏥 In-Person' },
                ].map(item => (
                  <div key={item.label} className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      <i className={`bi ${item.icon}`} />{item.label}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}

                {waitingTime && selectedSlot && (
                  <div style={{ background: 'var(--warning-light)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
                    <i className="bi bi-hourglass-split me-2" />
                    Est. wait: ~{waitingTime.estimatedMinutes} min ({waitingTime.waitingCount} ahead)
                  </div>
                )}

                <div className="divider" />

                {selectedDoctor && date && selectedSlot && (
                  <div className="alert alert-success py-2 mb-3" style={{ fontSize: 12 }}>
                    <i className="bi bi-check-circle-fill me-2" />Ready to confirm
                  </div>
                )}

                <button className="btn btn-primary w-100 mb-2" onClick={handleBook}
                  disabled={loading || !selectedDoctor || !date || !selectedSlot} style={{ padding: '10px' }}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Booking...</>
                    : <><i className="bi bi-check-lg me-2" />Confirm Appointment</>
                  }
                </button>
                <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/dashboard')}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
