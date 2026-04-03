import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

const STATUS_BADGE = {
  waiting:   <span className="badge-status badge-waiting"><i className="bi bi-clock-fill" /> Waiting</span>,
  completed: <span className="badge-status badge-completed"><i className="bi bi-check-circle-fill" /> Completed</span>,
  cancelled: <span className="badge-status badge-cancelled"><i className="bi bi-x-circle-fill" /> Cancelled</span>,
  'no-show': <span className="badge-status badge-noshow"><i className="bi bi-dash-circle-fill" /> No-Show</span>,
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

  return (
    <div>
      <TopHeader
        title={isDoctor ? 'Doctor Dashboard' : 'My Appointments'}
        subtitle={`Home / Dashboard · Refreshed ${lastRefresh.toLocaleTimeString()}`}
        actions={
          isDoctor && (
            <button
              className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggle}
            >
              <i className={`bi ${isAvailable ? 'bi-circle-fill' : 'bi-circle'}`} style={{ fontSize: 8 }} />
              {' '}{isAvailable ? 'Available' : 'Unavailable'}
            </button>
          )
        }
      />

      <div className="page-content">

        {/* Stats Row */}
        <div className="row g-3 mb-4" style={{ '--bs-gutter-x': '16px' }}>
          {[
            { icon: 'bi-clock-history', label: 'In Queue', value: waiting.length, color: '#fef3c7', iconColor: '#d97706' },
            { icon: 'bi-check-circle', label: 'Completed', value: completed.length, color: '#d1fae5', iconColor: '#059669' },
            { icon: 'bi-x-circle', label: 'Cancelled', value: cancelled.length, color: '#fee2e2', iconColor: '#dc2626' },
            isDoctor
              ? { icon: 'bi-bar-chart-line', label: "Today's Utilization", value: `${utilization}%`, color: '#ede9fe', iconColor: '#7c3aed' }
              : { icon: 'bi-calendar3', label: 'Total', value: appointments.length, color: '#dbeafe', iconColor: '#2563eb' },
          ].map((s, i) => (
            <div className="col-6 col-xl-3" key={i}>
              <div className="stat-card slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="stat-icon-box" style={{ background: s.color }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.iconColor, fontSize: 20 }} />
                </div>
                <div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                  {isDoctor && i === 3 && (
                    <div className="progress mt-1" style={{ width: 80 }}>
                      <div className="progress-bar" style={{ width: `${utilization}%`, background: utilization > 70 ? '#059669' : '#d97706' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="card fade-in">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div className="card-title-text">
                {isDoctor ? 'Patient Queue' : 'Appointment History'}
                <span className="ms-2" style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                  <i className="bi bi-circle-fill" style={{ fontSize: 7 }} /> LIVE
                </span>
              </div>
              <div className="card-subtitle-text">{filtered.length} records</div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {['all', 'waiting', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(f)}
                  style={{ textTransform: 'capitalize', fontSize: 12 }}
                >
                  {f}
                </button>
              ))}
              {!isDoctor && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
                  <i className="bi bi-plus-lg me-1" />Book
                </button>
              )}
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span className="ms-3" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox" />
                <h6>No appointments found</h6>
                <p>
                  {!isDoctor && (
                    <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate('/book')}>
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
                      <th>Est. Wait</th>
                      <th>Status</th>
                      <th>Actions</th>
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
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--surface-2)', color: 'var(--primary)',
                                fontSize: 12, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, border: '1px solid var(--border)',
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
                          <td style={{ fontSize: 13 }}>{a.date}</td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{a.timeSlot}</span>
                          </td>
                          <td>
                            {a.status === 'waiting'
                              ? <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>#{a.queuePosition}</span>
                              : <span style={{ color: 'var(--text-light)' }}>—</span>}
                          </td>
                          <td>
                            {waitMins !== null ? (
                              <span style={{
                                fontSize: 12, fontWeight: 600,
                                color: waitMins === 0 ? '#059669' : waitMins <= 30 ? '#d97706' : '#dc2626',
                              }}>
                                {waitMins === 0 ? '🟢 Next!' : `~${waitMins}m`}
                              </span>
                            ) : <span style={{ color: 'var(--text-light)' }}>—</span>}
                          </td>
                          <td>{STATUS_BADGE[a.status] || STATUS_BADGE.cancelled}</td>
                          <td>
                            {a.status === 'waiting' && (
                              <div className="d-flex gap-1">
                                {isDoctor && (
                                  <>
                                    <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 10px' }}
                                      onClick={() => handleStatus(a._id, 'completed')} title="Mark Complete">
                                      <i className="bi bi-check-lg" />
                                    </button>
                                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '3px 10px' }}
                                      onClick={() => handleStatus(a._id, 'cancelled')} title="No Show">
                                      <i className="bi bi-person-dash" />
                                    </button>
                                  </>
                                )}
                                <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11, padding: '3px 10px' }}
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
    </div>
  );
}
