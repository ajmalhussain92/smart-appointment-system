import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

const STATUS_BADGE = {
  waiting:   <span className="badge-status badge-waiting">Waiting</span>,
  completed: <span className="badge-status badge-completed">Completed</span>,
  cancelled: <span className="badge-status badge-cancelled">Cancelled</span>,
  'no-show': <span className="badge-status badge-noshow">No-Show</span>,
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await appointmentAPI.cancel(id); fetchData(true); } catch (e) { console.error(e); }
  };

  const waiting   = appointments.filter(a => a.status === 'waiting');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const filtered  = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const nextAppt  = waiting.sort((a, b) => a.queuePosition - b.queuePosition)[0];

  return (
    <div>
      <TopHeader
        title="My Appointments"
        subtitle={`Home / Dashboard  ·  Updated ${lastRefresh.toLocaleTimeString()}`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
            <i className="bi bi-plus-lg me-1" />Book Appointment
          </button>
        }
      />

      <div className="page-content">

        {/* ── Stats ── */}
        <div className="row g-3 mb-3">
          {[
            { icon: 'bi-clock-history',     label: 'Waiting',   value: waiting.length,   color: '#f79009', bg: 'var(--warning-light)' },
            { icon: 'bi-check-circle-fill', label: 'Completed', value: completed.length, color: '#12b76a', bg: 'var(--success-light)' },
            { icon: 'bi-x-circle-fill',     label: 'Cancelled', value: cancelled.length, color: '#f04438', bg: 'var(--danger-light)'  },
            { icon: 'bi-calendar3',         label: 'Total',     value: appointments.length, color: '#3b82f6', bg: 'var(--primary-light)' },
          ].map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="stat-card slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon-box" style={{ background: s.bg }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
                </div>
                <div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">

          {/* ── Appointments Table ── */}
          <div className="col-12 col-xl-8">
            <div className="card fade-in">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="card-title-text d-flex align-items-center gap-2">
                    Appointment History
                    <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, background: 'var(--success-light)', padding: '2px 8px', borderRadius: 20 }}>
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: 6 }} />LIVE
                    </span>
                  </div>
                  <div className="card-subtitle-text">{filtered.length} records</div>
                </div>
                <div className="d-flex gap-1 flex-wrap">
                  {['all', 'waiting', 'completed', 'cancelled'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5 gap-3">
                    <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-calendar-x" />
                    <h6>No appointments found</h6>
                    <p>
                      <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/book')}>
                        <i className="bi bi-plus-lg me-1" />Book Appointment
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="pro-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Doctor</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Queue</th>
                          <th>Est. Wait</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((a, i) => {
                          const waitMins = a.status === 'waiting' ? (a.queuePosition - 1) * 15 : null;
                          return (
                            <tr key={a._id}>
                              <td style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                                    color: '#fff', fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    {a.doctor?.name?.[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Dr. {a.doctor?.name}</div>
                                    {a.doctor?.specialization && (
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
                                    {waitMins === 0 ? '● Next!' : `~${waitMins}m`}
                                  </span>
                                ) : <span style={{ color: 'var(--text-light)' }}>—</span>}
                              </td>
                              <td>{STATUS_BADGE[a.status] || STATUS_BADGE.cancelled}</td>
                              <td>
                                {a.status === 'waiting' && (
                                  <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
                                    onClick={() => handleCancel(a._id)}>
                                    <i className="bi bi-x-lg" />
                                  </button>
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

          {/* ── Right Panel ── */}
          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-3">

              {/* Next Appointment */}
              <div className="card scale-in">
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-alarm-fill me-2" style={{ color: 'var(--primary)' }} />
                    Next Appointment
                  </div>
                </div>
                <div className="card-body">
                  {!nextAppt ? (
                    <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)' }}>
                      <i className="bi bi-calendar-check-fill" style={{ fontSize: 28, color: 'var(--success)', display: 'block', marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>No upcoming appointments</div>
                      <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/book')}>
                        <i className="bi bi-plus-lg me-1" />Book Now
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                          color: '#fff', fontSize: 17, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {nextAppt.doctor?.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Dr. {nextAppt.doctor?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{nextAppt.doctor?.specialization}</div>
                        </div>
                      </div>
                      {[
                        { icon: 'bi-calendar3',    label: 'Date',     value: nextAppt.date },
                        { icon: 'bi-clock',        label: 'Time',     value: nextAppt.timeSlot },
                        { icon: 'bi-hash',         label: 'Queue',    value: `#${nextAppt.queuePosition}` },
                        { icon: 'bi-hourglass',    label: 'Est. Wait', value: nextAppt.queuePosition === 1 ? 'You are next!' : `~${(nextAppt.queuePosition - 1) * 15} min` },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: 12 }}>
                            <i className={`bi ${item.icon}`} />
                            {item.label}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
                        </div>
                      ))}
                      <button className="btn btn-outline-danger w-100 mt-2 btn-sm"
                        onClick={() => handleCancel(nextAppt._id)}>
                        <i className="bi bi-x-circle me-1" />Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card scale-in" style={{ animationDelay: '0.08s' }}>
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-lightning-fill me-2" style={{ color: 'var(--warning)' }} />
                    Quick Actions
                  </div>
                </div>
                <div className="card-body" style={{ padding: '12px !important' }}>
                  {[
                    { icon: 'bi-calendar-plus-fill', label: 'Book Appointment', color: '#3b82f6', action: () => navigate('/book') },
                    { icon: 'bi-person-badge-fill',  label: 'Find Doctors',     color: '#7c3aed', action: () => navigate('/doctors') },
                  ].map(q => (
                    <button
                      key={q.label}
                      onClick={q.action}
                      className="w-100 d-flex align-items-center gap-3"
                      style={{
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                        marginBottom: 8, transition: 'all 0.15s', color: 'var(--text)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 16 }} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</span>
                      <i className="bi bi-chevron-right ms-auto" style={{ fontSize: 12, color: 'var(--text-light)' }} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
