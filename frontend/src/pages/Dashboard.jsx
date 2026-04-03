import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import { subscribeToQueue, unsubscribeFromQueue } from '../api/socket';

const STATUS_BADGE = {
  waiting:   <span className="badge-status badge-waiting"><i className="bi bi-clock-fill" style={{fontSize:9}} /> Waiting</span>,
  completed: <span className="badge-status badge-completed"><i className="bi bi-check-circle-fill" style={{fontSize:9}} /> Completed</span>,
  cancelled: <span className="badge-status badge-cancelled"><i className="bi bi-x-circle-fill" style={{fontSize:9}} /> Cancelled</span>,
  'no-show': <span className="badge-status badge-noshow"><i className="bi bi-dash-circle-fill" style={{fontSize:9}} /> No-Show</span>,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const isDoctor = user?.role === 'doctor';
  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async (silent = false) => {
    try {
      const { data } = await appointmentAPI.getMy();
      setAppointments(data);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  useEffect(() => {
    if (isDoctor && user?._id) {
      subscribeToQueue(user._id, () => fetchData(true));
    }
    return () => unsubscribeFromQueue();
  }, [isDoctor, user?._id, fetchData]);

  const handleStatus = async (id, status) => {
    try { await appointmentAPI.updateStatus(id, status); fetchData(true); } catch (e) { console.error(e); }
  };
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await appointmentAPI.cancel(id); fetchData(true); } catch (e) { console.error(e); }
  };
  const handleToggle = async () => {
    try { const { data } = await doctorAPI.toggleAvailability(); setIsAvailable(data.isAvailable); }
    catch (e) { console.error(e); }
  };

  const waiting   = appointments.filter(a => a.status === 'waiting');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status !== 'waiting' && a.status !== 'completed');
  const todayList = appointments.filter(a => a.date === today);
  const utilization = todayList.length > 0
    ? Math.round((todayList.filter(a => a.status === 'completed').length / todayList.length) * 100) : 0;
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const stats = [
    { icon: 'bi-clock-history',  label: 'In Queue',    value: waiting.length,    bg: 'var(--warning-light)', color: '#b45309' },
    { icon: 'bi-check-circle-fill', label: 'Completed', value: completed.length, bg: 'var(--success-light)', color: '#027a48' },
    { icon: 'bi-x-circle-fill',  label: 'Cancelled',   value: cancelled.length,  bg: 'var(--danger-light)',  color: '#b42318' },
    isDoctor
      ? { icon: 'bi-bar-chart-fill', label: "Utilization", value: `${utilization}%`, bg: 'var(--purple-light)', color: '#5b21b6' }
      : { icon: 'bi-calendar3',  label: 'Total',       value: appointments.length, bg: 'var(--primary-light)', color: '#1d4ed8' },
  ];

  return (
    <div>
      <TopHeader
        title={isDoctor ? 'Doctor Dashboard' : 'My Appointments'}
        subtitle={`Home / Dashboard  ·  Updated ${lastRefresh.toLocaleTimeString()}`}
        actions={
          isDoctor && (
            <button
              className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggle}
              style={{ fontSize: 12 }}
            >
              <i className={`bi bi-circle-fill me-1`} style={{ fontSize: 7 }} />
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          )
        }
      />

      <div className="page-content">

        {/* ── Stats Grid ── */}
        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div className="col-6 col-xl-3" key={i}>
              <div className="stat-card slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon-box" style={{ background: s.bg }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
                </div>
                <div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                  {isDoctor && i === 3 && (
                    <div className="progress mt-2" style={{ width: 72 }}>
                      <div className="progress-bar" style={{ width: `${utilization}%`, background: utilization > 70 ? 'var(--success)' : 'var(--warning)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="row g-3">

          {/* ── Appointments Table ── */}
          <div className={isDoctor ? 'col-12 col-xl-8' : 'col-12'}>
            <div className="card fade-in h-100">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="card-title-text d-flex align-items-center gap-2">
                    {isDoctor ? 'Patient Queue' : 'Appointment History'}
                    <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, background: 'var(--success-light)', padding: '2px 8px', borderRadius: 20 }}>
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: 6 }} />LIVE
                    </span>
                  </div>
                  <div className="card-subtitle-text">{filtered.length} records found</div>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <div className="d-flex gap-1">
                    {['all', 'waiting', 'completed', 'cancelled'].map(f => (
                      <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                  {!isDoctor && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
                      <i className="bi bi-plus-lg me-1" />Book
                    </button>
                  )}
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5 gap-3">
                    <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading appointments...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-calendar-x" />
                    <h6>No appointments found</h6>
                    <p>
                      {!isDoctor && (
                        <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/book')}>
                          <i className="bi bi-plus-lg me-1" />Book Appointment
                        </button>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="pro-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{isDoctor ? 'Patient' : 'Doctor'}</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Queue</th>
                          <th>Wait</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((a, i) => {
                          const waitMins = a.status === 'waiting' ? (a.queuePosition - 1) * 15 : null;
                          return (
                            <tr key={a._id}>
                              <td style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 12, width: 40 }}>{i + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                                    color: '#fff', fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    {isDoctor ? a.patient?.name?.[0] : a.doctor?.name?.[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                                      {isDoctor ? a.patient?.name : `Dr. ${a.doctor?.name}`}
                                    </div>
                                    {!isDoctor && a.doctor?.specialization && (
                                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.doctor.specialization}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.date}</td>
                              <td><span style={{ fontWeight: 600, fontSize: 13 }}>{a.timeSlot}</span></td>
                              <td>
                                {a.status === 'waiting'
                                  ? <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>#{a.queuePosition}</span>
                                  : <span style={{ color: 'var(--text-light)' }}>—</span>}
                              </td>
                              <td>
                                {waitMins !== null ? (
                                  <span style={{ fontSize: 12, fontWeight: 600,
                                    color: waitMins === 0 ? 'var(--success)' : waitMins <= 30 ? 'var(--warning)' : 'var(--danger)' }}>
                                    {waitMins === 0 ? '● Next' : `~${waitMins}m`}
                                  </span>
                                ) : <span style={{ color: 'var(--text-light)' }}>—</span>}
                              </td>
                              <td>{STATUS_BADGE[a.status] || STATUS_BADGE.cancelled}</td>
                              <td>
                                {a.status === 'waiting' && (
                                  <div className="d-flex gap-1">
                                    {isDoctor && (
                                      <>
                                        <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
                                          onClick={() => handleStatus(a._id, 'completed')} title="Complete">
                                          <i className="bi bi-check-lg" />
                                        </button>
                                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
                                          onClick={() => handleStatus(a._id, 'cancelled')} title="No Show">
                                          <i className="bi bi-person-dash" />
                                        </button>
                                      </>
                                    )}
                                    <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
                                      onClick={() => handleCancel(a._id)} title="Cancel">
                                      <i className="bi bi-x-lg" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel (Doctor only) ── */}
          {isDoctor && (
            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-3">

                {/* Today Summary */}
                <div className="card scale-in">
                  <div className="card-header">
                    <div className="card-title-text">📅 Today's Summary</div>
                    <div className="card-subtitle-text">{today}</div>
                  </div>
                  <div className="card-body">
                    {[
                      { label: 'Total Scheduled', value: todayList.length, color: 'var(--primary)' },
                      { label: 'Completed', value: todayList.filter(a => a.status === 'completed').length, color: 'var(--success)' },
                      { label: 'Waiting', value: todayList.filter(a => a.status === 'waiting').length, color: 'var(--warning)' },
                      { label: 'Cancelled', value: todayList.filter(a => a.status === 'cancelled').length, color: 'var(--danger)' },
                    ].map(item => (
                      <div key={item.label} className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 4 }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Utilization Rate</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: utilization > 70 ? 'var(--success)' : 'var(--warning)' }}>{utilization}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${utilization}%`, background: utilization > 70 ? 'var(--success)' : 'var(--warning)', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next in Queue */}
                <div className="card scale-in" style={{ animationDelay: '0.1s' }}>
                  <div className="card-header">
                    <div className="card-title-text">⏳ Next in Queue</div>
                    <div className="card-subtitle-text">{waiting.length} patients waiting</div>
                  </div>
                  <div className="card-body p-0">
                    {waiting.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        <i className="bi bi-check-circle-fill" style={{ fontSize: 24, color: 'var(--success)', display: 'block', marginBottom: 8 }} />
                        Queue is clear!
                      </div>
                    ) : (
                      waiting.slice(0, 4).map((a, i) => (
                        <div key={a._id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          borderBottom: i < Math.min(waiting.length, 4) - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: i === 0 ? 'var(--primary)' : 'var(--surface-2)',
                            color: i === 0 ? '#fff' : 'var(--text-muted)',
                            fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {i === 0 ? <i className="bi bi-person-fill" style={{ fontSize: 13 }} /> : i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.patient?.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.timeSlot}</div>
                          </div>
                          {i === 0 && (
                            <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 10px', flexShrink: 0 }}
                              onClick={() => handleStatus(a._id, 'completed')}>
                              <i className="bi bi-check-lg" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── Patient Quick Actions ── */}
          {!isDoctor && (
            <div className="col-12 mt-1">
              <div className="card scale-in">
                <div className="card-header">
                  <div className="card-title-text">⚡ Quick Actions</div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {[
                      { icon: 'bi-calendar-plus-fill', label: 'Book Appointment', desc: 'Schedule with a doctor', color: '#3b82f6', action: () => navigate('/book') },
                      { icon: 'bi-person-badge-fill',  label: 'Find Doctors',     desc: 'Browse available doctors', color: '#7c3aed', action: () => navigate('/doctors') },
                      { icon: 'bi-clock-history',      label: 'My Queue',         desc: `${waiting.length} appointments waiting`, color: '#f79009', action: () => setFilter('waiting') },
                      { icon: 'bi-check-circle-fill',  label: 'History',          desc: `${completed.length} completed visits`, color: '#12b76a', action: () => setFilter('completed') },
                    ].map(q => (
                      <div className="col-6 col-md-3" key={q.label}>
                        <div
                          onClick={q.action}
                          style={{
                            padding: '16px', borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-2)',
                            cursor: 'pointer', transition: 'all 0.15s',
                            textAlign: 'center',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 18 }} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{q.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
