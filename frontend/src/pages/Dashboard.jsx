import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import Spinner from '../components/Spinner';
import NotificationBanner from '../components/NotificationBanner';

const STATUS_BADGE = {
  waiting:   <span className="badge badge-waiting">⏳ Waiting</span>,
  completed: <span className="badge badge-completed">✓ Completed</span>,
  cancelled: <span className="badge badge-cancelled">✕ Cancelled</span>,
  'no-show': <span className="badge badge-noshow">👻 No-Show</span>,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAppointments = useCallback(async (silent = false) => {
    try {
      const { data } = await appointmentAPI.getMy();
      setAppointments(data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => {
    const t = setInterval(() => fetchAppointments(true), 30000);
    return () => clearInterval(t);
  }, [fetchAppointments]);

  const handleStatusChange = async (id, status) => {
    try { await appointmentAPI.updateStatus(id, status); fetchAppointments(true); }
    catch (e) { console.error(e); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await appointmentAPI.cancel(id); fetchAppointments(true); }
    catch (e) { console.error(e); }
  };

  const handleToggle = async () => {
    try {
      const { data } = await doctorAPI.toggleAvailability();
      setIsAvailable(data.isAvailable);
    } catch (e) { console.error(e); }
  };

  const isDoctor = user?.role === 'doctor';
  const today = new Date().toISOString().split('T')[0];

  const waiting   = appointments.filter(a => a.status === 'waiting');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status !== 'waiting' && a.status !== 'completed');
  const todayAppts = appointments.filter(a => a.date === today);

  const filtered = filter === 'all' ? appointments
    : appointments.filter(a => a.status === filter);

  const utilization = todayAppts.length > 0
    ? Math.round((todayAppts.filter(a => a.status === 'completed').length / todayAppts.length) * 100)
    : 0;

  return (
    <div>
      <TopHeader
        title={isDoctor ? 'Doctor Dashboard' : 'My Appointments'}
        subtitle={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
        actions={
          isDoctor && (
            <button
              className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggle}
            >
              {isAvailable ? '● Available' : '● Unavailable'}
            </button>
          )
        }
      />

      <div className="page-body">
        <NotificationBanner appointments={appointments} />

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
            <div>
              <div className="stat-value">{waiting.length}</div>
              <div className="stat-label">In Queue</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
            <div>
              <div className="stat-value">{completed.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>✕</div>
            <div>
              <div className="stat-value">{cancelled.length}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
          {isDoctor ? (
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ede9fe' }}>📊</div>
              <div>
                <div className="stat-value">{utilization}%</div>
                <div className="stat-label">Today's Utilization</div>
                <div className="progress-bar mt-4" style={{ width: 80, marginTop: 6 }}>
                  <div className="progress-fill"
                    style={{ width: `${utilization}%`, background: utilization > 70 ? '#16a34a' : '#d97706' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>📋</div>
              <div>
                <div className="stat-value">{appointments.length}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
            </div>
          )}
        </div>

        {/* Appointments Table */}
        <div className="card animate-fade">
          <div className="card-header">
            <div>
              <div className="card-title">
                {isDoctor ? 'Patient Queue' : 'Appointment History'}
                <span style={{ marginLeft: 8, fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
                  ● Live
                </span>
              </div>
              <div className="card-subtitle">{filtered.length} records</div>
            </div>
            <div className="flex gap-2">
              {['all', 'waiting', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilter(f)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {f}
                </button>
              ))}
              {!isDoctor && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
                  + Book
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <Spinner text="Loading appointments..." />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No appointments found</div>
              <div className="empty-state-text">
                {!isDoctor && <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/book')}>Book Appointment</button>}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{isDoctor ? 'Patient' : 'Doctor'}</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Queue</th>
                    <th>Wait Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const waitMins = a.status === 'waiting' ? ((a.queuePosition - 1) * 15) : null;
                    return (
                      <tr key={a._id} className="animate-slide">
                        <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {isDoctor ? a.patient?.name : `Dr. ${a.doctor?.name}`}
                          </div>
                          {!isDoctor && a.doctor?.specialization && (
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{a.doctor.specialization}</div>
                          )}
                        </td>
                        <td>{a.date}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{a.timeSlot}</span>
                        </td>
                        <td>
                          {a.status === 'waiting'
                            ? <span style={{ fontWeight: 700, color: '#2563eb' }}>#{a.queuePosition}</span>
                            : <span style={{ color: '#9ca3af' }}>—</span>}
                        </td>
                        <td>
                          {waitMins !== null ? (
                            <span style={{
                              fontSize: 12, fontWeight: 600,
                              color: waitMins === 0 ? '#16a34a' : waitMins <= 30 ? '#d97706' : '#dc2626'
                            }}>
                              {waitMins === 0 ? 'Next!' : `~${waitMins}m`}
                            </span>
                          ) : <span style={{ color: '#9ca3af' }}>—</span>}
                        </td>
                        <td>{STATUS_BADGE[a.status] || STATUS_BADGE.cancelled}</td>
                        <td>
                          {a.status === 'waiting' && (
                            <div className="flex gap-2">
                              {isDoctor && (
                                <>
                                  <button className="btn btn-success btn-sm"
                                    onClick={() => handleStatusChange(a._id, 'completed')}>
                                    ✓
                                  </button>
                                  <button className="btn btn-ghost btn-sm"
                                    onClick={() => handleStatusChange(a._id, 'cancelled')}>
                                    👻
                                  </button>
                                </>
                              )}
                              <button className="btn btn-outline btn-sm"
                                onClick={() => handleCancel(a._id)}
                                style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                                ✕
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
  );
}
