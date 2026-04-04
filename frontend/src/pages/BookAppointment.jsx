import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [specFilter, setSpecFilter] = useState('all');
  const [isOffDay, setIsOffDay] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    doctorAPI.getAll().then(({ data }) => {
      setDoctors(data);
      // Pre-select doctor if coming from DoctorsPage
      if (location.state?.doctor) {
        setSelectedDoctor(location.state.doctor);
      }
    }).finally(() => setDoctorsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) {
      setSlotsLoaded(false);
      setAvailableSlots([]);
      setBookedSlots([]);
      setWaitingTime(null);
      return;
    }

    setSelectedSlot('');
    setSlotsLoaded(false);
    setWaitingTime(null);
    setIsOffDay(false);

    if (selectedDoctor.offDays?.includes(date) && !selectedDoctor.consultationType?.includes('online')) {
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
      if (slotsRes.data.isOffDay) {
        setIsOffDay(true);
        setApptType('online');
        setAlert({ msg: "Doctor's off day — only online appointments available.", type: 'warning' });
      }
    }).catch(err => {
      console.error(err);
      setAlert({ msg: err.response?.data?.message || 'Failed to load slots', type: 'danger' });
    });
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
      console.error('Booking error:', err);
      showAlert(err.response?.data?.message || 'Booking failed.');
    } finally { setLoading(false); }
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const progress = [selectedDoctor, date, selectedSlot].filter(Boolean).length;
  const specializations = ['all', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const filteredDoctors = specFilter === 'all' ? doctors : doctors.filter(d => d.specialization === specFilter);

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

        {/* Progress Timeline */}
        <div className="card mb-3">
          <div className="card-body py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Booking Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{progress}/3 steps</span>
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                  <div className="progress-bar" style={{
                    width: `${(progress / 3) * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                    transition: 'width 0.4s ease',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            </div>
            
            {/* Timeline Steps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connecting Line */}
              <div style={{
                position: 'absolute', top: 20, left: '16.67%', right: '16.67%', height: 2,
                background: 'var(--border)', zIndex: 0,
              }} />
              <div style={{
                position: 'absolute', top: 20, left: '16.67%', 
                width: `${(progress - 1) * 33.33}%`, height: 2,
                background: 'var(--primary)', zIndex: 1, transition: 'width 0.4s ease',
              }} />
              
              {/* Step 1: Doctor */}
              <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                  background: selectedDoctor ? 'var(--primary)' : 'var(--surface-2)',
                  border: `2px solid ${selectedDoctor ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selectedDoctor ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 16, transition: 'all 0.3s',
                }}>
                  {selectedDoctor ? <i className="bi bi-check-lg" /> : '1'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: selectedDoctor ? 'var(--primary)' : 'var(--text-muted)' }}>
                  Doctor
                </div>
              </div>
              
              {/* Step 2: Date */}
              <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                  background: date ? 'var(--primary)' : 'var(--surface-2)',
                  border: `2px solid ${date ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: date ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 16, transition: 'all 0.3s',
                }}>
                  {date ? <i className="bi bi-check-lg" /> : '2'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: date ? 'var(--primary)' : 'var(--text-muted)' }}>
                  Date
                </div>
              </div>
              
              {/* Step 3: Time */}
              <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                  background: selectedSlot ? 'var(--primary)' : 'var(--surface-2)',
                  border: `2px solid ${selectedSlot ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selectedSlot ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 16, transition: 'all 0.3s',
                }}>
                  {selectedSlot ? <i className="bi bi-check-lg" /> : '3'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: selectedSlot ? 'var(--primary)' : 'var(--text-muted)' }}>
                  Time
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {/* Main Content */}
          <div className="col-lg-8">

            {/* Step 1: Select Doctor */}
            <div className="card mb-3 fade-in">
              <div className="card-header">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="card-title-text">
                      <i className="bi bi-person-badge me-2" style={{ color: 'var(--primary)' }} />
                      Step 1: Select Doctor
                    </div>
                    <div className="card-subtitle-text">Choose a doctor to proceed</div>
                  </div>
                  <div className="d-flex gap-1 flex-wrap">
                    {specializations.map(s => (
                      <button key={s} className={`btn btn-sm ${specFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => { setSpecFilter(s); setSelectedDoctor(null); }}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}>
                        {s === 'all' ? 'All' : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-body">
                {doctorsLoading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-person-slash" />
                    <h6>No doctors available</h6>
                  </div>
                ) : (
                  <div className="row g-2">
                    {filteredDoctors.map(doc => (
                      <div className="col-6 col-md-4" key={doc._id}>
                        <div 
                          onClick={() => doc.isAvailable && setSelectedDoctor(doc)} 
                          style={{
                            padding: '16px 12px', 
                            borderRadius: 10, 
                            textAlign: 'center', 
                            cursor: doc.isAvailable ? 'pointer' : 'not-allowed',
                            border: `2px solid ${selectedDoctor?._id === doc._id ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedDoctor?._id === doc._id ? 'var(--primary-light)' : 'var(--surface)',
                            opacity: doc.isAvailable ? 1 : 0.5, 
                            transition: 'all 0.2s',
                            boxShadow: selectedDoctor?._id === doc._id ? '0 4px 12px rgba(59,130,246,0.2)' : 'none',
                          }}
                          onMouseEnter={e => {
                            if (doc.isAvailable && selectedDoctor?._id !== doc._id) {
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.background = 'var(--primary-light)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (selectedDoctor?._id !== doc._id) {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.background = 'var(--surface)';
                            }
                          }}
                        >
                          <div style={{
                            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 10px',
                            background: selectedDoctor?._id === doc._id ? 'var(--primary)' : 'var(--surface-2)',
                            color: selectedDoctor?._id === doc._id ? '#fff' : 'var(--primary)',
                            fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--border)',
                          }}>{doc.name[0]}</div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>Dr. {doc.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{doc.specialization || 'General'}</div>
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            {(doc.consultationType || ['in-person']).map(t => (
                              <span key={t} style={{
                                fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 600,
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

            {/* Step 2: Select Date & Type */}
            <div className="card mb-3 fade-in" style={{ opacity: selectedDoctor ? 1 : 0.5, pointerEvents: selectedDoctor ? 'auto' : 'none' }}>
              <div className="card-header">
                <div className="card-title-text">
                  <i className="bi bi-calendar3 me-2" style={{ color: selectedDoctor ? 'var(--primary)' : 'var(--text-light)' }} />
                  Step 2: Select Date & Type
                </div>
                <div className="card-subtitle-text">
                  {!selectedDoctor ? 'Select a doctor first' : 'Choose appointment date and type'}
                </div>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Date Column */}
                  <div className="col-md-6">
                    <label className="form-label" style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                      <i className="bi bi-calendar-event me-2" style={{ color: 'var(--primary)' }} />
                      Appointment Date
                    </label>
                    <input 
                      type="date" 
                      className="form-control" 
                      min={today} 
                      max={getMaxDate()}
                      value={date}
                      onChange={e => { setDate(e.target.value); setAlert(null); }}
                      disabled={!selectedDoctor}
                      style={{ fontSize: 14, padding: '10px 12px', fontWeight: 500 }}
                    />
                    {date && (
                      <div style={{ color: 'var(--success)', marginTop: 8, display: 'block', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
                        <i className="bi bi-check-circle-fill me-2" />
                        {formatDate(date)}
                      </div>
                    )}
                  </div>

                  {/* Type Column - Disabled until date selected */}
                  <div className="col-md-6" style={{ opacity: date ? 1 : 0.5, pointerEvents: date ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                    <label className="form-label" style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: date ? 'var(--text)' : 'var(--text-light)' }}>
                      <i className="bi bi-hospital me-2" style={{ color: date ? 'var(--primary)' : 'var(--text-light)' }} />
                      Appointment Type
                    </label>
                    <div className="d-flex gap-2">
                      {(isOffDay ? ['online'] : (selectedDoctor?.consultationType || ['in-person'])).map(t => (
                        <button 
                          key={t} 
                          type="button"
                          className={`btn btn-sm flex-fill ${apptType === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setApptType(t)}
                          disabled={!date}
                          style={{ fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                          <i className={`bi ${t === 'online' ? 'bi-camera-video-fill' : 'bi-hospital-fill'} me-1`} />
                          {t === 'online' ? 'Online' : 'In-Person'}
                        </button>
                      ))}
                    </div>
                    {!date && (
                      <small style={{ color: 'var(--text-light)', marginTop: 6, display: 'block', fontSize: 11 }}>
                        <i className="bi bi-lock-fill me-1" />
                        Select date first to unlock
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Select Time Slot */}
            <div className="card fade-in" style={{ opacity: date && slotsLoaded ? 1 : 0.5, pointerEvents: date && slotsLoaded ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <div className="card-header">
                <div className="card-title-text">
                  <i className="bi bi-clock me-2" style={{ color: date && slotsLoaded ? 'var(--primary)' : 'var(--text-light)' }} />
                  Step 3: Choose Time Slot
                </div>
                <div className="card-subtitle-text">
                  {!date ? 'Select a date first' : !slotsLoaded ? 'Loading available slots...' : `${availableSlots.length} available · ${bookedSlots.length} booked`}
                </div>
              </div>
              <div className="card-body">
                {!date ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                    <i className="bi bi-calendar-x" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: 0.3 }} />
                    <p>Select a date to see available time slots</p>
                  </div>
                ) : !slotsLoaded ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  </div>
                ) : availableSlots.length === 0 && bookedSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                    <i className="bi bi-calendar-x-fill" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: 0.3 }} />
                    <p>No slots available for this date</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
                    {ALL_SLOTS.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      const isAvail = availableSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      if (!isAvail && !isBooked) return null;
                      
                      return (
                        <button 
                          key={slot} 
                          disabled={isBooked} 
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '14px 8px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid var(--primary)' : isBooked ? '1px solid var(--border)' : '1px solid var(--primary)',
                            background: isSelected ? 'var(--primary)' : isBooked ? 'var(--surface-2)' : 'var(--surface)',
                            color: isSelected ? '#fff' : isBooked ? 'var(--text-light)' : 'var(--text)',
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: 13,
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            opacity: isBooked ? 0.4 : 1,
                            textDecoration: isBooked ? 'line-through' : 'none',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                          }}
                          onMouseEnter={e => {
                            if (!isBooked && !isSelected) {
                              e.currentTarget.style.background = 'var(--primary-light)';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isBooked && !isSelected) {
                              e.currentTarget.style.background = 'var(--surface)';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                            }
                          }}
                        >
                          {isBooked && <i className="bi bi-lock-fill me-1" style={{ fontSize: 10 }} />}
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="card-header">
                <div className="card-title-text">
                  <i className="bi bi-clipboard-check me-2" style={{ color: 'var(--primary)' }} />
                  Booking Summary
                </div>
              </div>
              <div className="card-body">
                {/* Doctor */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    <i className="bi bi-person-badge me-1" />Doctor
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedDoctor ? 'var(--text)' : 'var(--text-light)' }}>
                    {selectedDoctor ? `Dr. ${selectedDoctor.name}` : '—'}
                  </div>
                  {selectedDoctor && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {selectedDoctor.specialization}
                    </div>
                  )}
                </div>

                <div className="divider" />

                {/* Date */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    <i className="bi bi-calendar3 me-1" />Date
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: date ? 'var(--text)' : 'var(--text-light)', letterSpacing: 1 }}>
                    {date ? formatDate(date) : '—'}
                  </div>
                </div>

                <div className="divider" />

                {/* Time */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    <i className="bi bi-clock me-1" />Time Slot
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedSlot ? 'var(--text)' : 'var(--text-light)' }}>
                    {selectedSlot || '—'}
                  </div>
                </div>

                <div className="divider" />

                {/* Type */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    <i className="bi bi-hospital me-1" />Type
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {apptType === 'online' ? '🎥 Online' : '🏥 In-Person'}
                  </div>
                </div>

                {/* Waiting Time */}
                {waitingTime && selectedSlot && (
                  <>
                    <div className="divider" />
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                        <i className="bi bi-hourglass-split me-1" />Est. Wait Time
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>
                        ~{waitingTime.estimatedMinutes} minutes
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {waitingTime.waitingCount} patient{waitingTime.waitingCount !== 1 ? 's' : ''} ahead
                      </div>
                    </div>
                  </>
                )}

                <div className="divider" />

                {/* Ready Status */}
                {selectedDoctor && date && selectedSlot ? (
                  <div className="alert alert-success py-2 mb-3" style={{ fontSize: 12 }}>
                    <i className="bi bi-check-circle-fill me-2" />
                    <strong>Ready to book!</strong> All details confirmed.
                  </div>
                ) : (
                  <div className="alert alert-info py-2 mb-3" style={{ fontSize: 12 }}>
                    <i className="bi bi-info-circle-fill me-2" />
                    Complete all steps to proceed
                  </div>
                )}

                {/* Action Buttons */}
                <button 
                  className="btn btn-primary w-100 mb-2" 
                  onClick={handleBook}
                  disabled={loading || !selectedDoctor || !date || !selectedSlot} 
                  style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Booking...</>
                    : <><i className="bi bi-check-lg me-2" />Confirm Appointment</>
                  }
                </button>
                <button 
                  className="btn btn-outline-secondary w-100" 
                  onClick={() => navigate('/dashboard')}
                  style={{ fontWeight: 600 }}>
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
