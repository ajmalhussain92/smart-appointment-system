import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import { subscribeToQueue, unsubscribeFromQueue } from '../api/socket';

const STATUS_BADGE = {
  waiting:   <span className="badge-status badge-waiting">Waiting</span>,
  completed: <span className="badge-status badge-completed">Completed</span>,
  cancelled: <span className="badge-status badge-cancelled">Cancelled</span>,
  'no-show': <span className="badge-status badge-noshow">No-Show</span>,
};

// ── Metric Card ──────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className="stat-card slide-up">
      <div className="stat-icon-box" style={{ background: color + '18' }}>
        <i className={`bi ${icon}`} style={{ color, fontSize: 22 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{sub}</div>}
      </div>
      {trend !== undefined && (
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          background: trend >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
          color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
          alignSelf: 'flex-start',
        }}>
          <i className={`bi bi-arrow-${trend >= 0 ? 'up' : 'down'}`} style={{ fontSize: 9 }} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ── Queue Row ────────────────────────────────────────────
function QueueRow({ appt, position, onComplete, onNoShow, onCancel }) {
  const waitMins = (position - 1) * 15;
  const isNext = position === 1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: isNext ? 'var(--primary-light)' : 'transparent',
      borderBottom: '1px solid var(--border)',
      transition: 'background 0.2s',
    }}>
      {/* Position */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isNext ? 'var(--primary)' : 'var(--surface-2)',
        color: isNext ? '#fff' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
        border: isNext ? 'none' : '1px solid var(--border)',
      }}>
        {isNext ? <i className="bi bi-person-fill" /> : position}
      </div>

      {/* Patient info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {appt.patient?.name}
          {isNext && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>NEXT</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          <i className="bi bi-clock me-1" />{appt.timeSlot}
          {waitMins > 0 && <span style={{ marginLeft: 8, color: waitMins > 30 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>~{waitMins}m wait</span>}
          {waitMins === 0 && <span style={{ marginLeft: 8, color: 'var(--success)', fontWeight: 600 }}>Ready now</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-1">
        <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => onComplete(appt._id)} title="Mark Complete">
          <i className="bi bi-check-lg" />
        </button>
        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => onNoShow(appt._id)} title="No Show">
          <i className="bi bi-person-dash" />
        </button>
        <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => onCancel(appt._id)} title="Cancel">
          <i className="bi bi-x-lg" />
        </button>
      </div>
    </div>
  );
}

// ── Schedule Timeline ────────────────────────────────────
function ScheduleTimeline({ appointments, today, onComplete, onNoShow, onCancel }) {
  const todayAppts = appointments
    .filter(a => a.date === today)
    .sort((a, b) => a.queuePosition - b.queuePosition);

  if (todayAppts.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 20px' }}>
        <i className="bi bi-calendar-check" style={{ fontSize: 36, opacity: 0.3, display: 'block', marginBottom: 10 }} />
        <h6 style={{ fontSize: 14 }}>No appointments today</h6>
        <p style={{ fontSize: 12 }}>Your schedule is clear</p>
      </div>
    );
  }

  return (
    <div>
      {todayAppts.map((a, i) => (
        <div key={a._id} style={{
          display: 'flex', gap: 0,
          borderBottom: i < todayAppts.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          {/* Time column */}
          <div style={{
            width: 72, flexShrink: 0, padding: '14px 12px',
            borderRight: '1px solid var(--border)',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.timeSlot.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.timeSlot.split(' ')[1]}</div>
          </div>

          {/* Content */}
          <div style={{
            flex: 1, padding: '12px 14px',
            background: a.status === 'waiting' && a.queuePosition === 1 ? 'var(--primary-light)' : 'transparent',
            transition: 'background 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{a.patient?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Queue #{a.queuePosition}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {STATUS_BADGE[a.status]}
                {a.status === 'waiting' && (
                  <div className="d-flex gap-1">
                    <button className="btn btn-success btn-sm" style={{ fontSize: 10, padding: '2px 8px' }}
                      onClick={() => onComplete(a._id)}>
                      <i className="bi bi-check-lg" />
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: '2px 8px' }}
                      onClick={() => onNoShow(a._id)}>
                      <i className="bi bi-person-dash" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────
export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [lastRefresh, setLastRefresh] = useState(new Date());
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
    if (user?._id) subscribeToQueue(user._id, () => fetchData(true));
    return () => unsubscribeFromQueue();
  }, [user?._id, fetchData]);

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

  // Computed
  const todayAppts  = appointments.filter(a => a.date === today);
  const waiting     = appointments.filter(a => a.status === 'waiting');
  const todayWait   = todayAppts.filter(a => a.status === 'waiting');
  const todayDone   = todayAppts.filter(a => a.status === 'completed');
  const utilization = todayAppts.length > 0 ? Math.round((todayDone.length / todayAppts.length) * 100) : 0;
  const avgWait     = waiting.length > 0 ? waiting.length * 15 : 0;

  const tabs = [
    { key: 'queue',    label: 'Live Queue',    icon: 'bi-people-fill',      count: waiting.length },
    { key: 'schedule', label: 'Today Schedule', icon: 'bi-calendar3',       count: todayAppts.length },
    { key: 'history',  label: 'History',        icon: 'bi-clock-history',   count: null },
  ];

  return (
    <div>
      <TopHeader
        title="Doctor Dashboard"
        subtitle={`Home / Dashboard  ·  ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <button
            className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
            onClick={handleToggle}
            style={{ fontSize: 12 }}
          >
            <i className="bi bi-circle-fill me-1" style={{ fontSize: 7 }} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
        }
      />

      <div className="page-content">

        {/* ── KPI Metrics ── */}
        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3">
            <MetricCard icon="bi-people-fill"      label="In Queue"       value={waiting.length}    color="#3b82f6" sub={`${todayWait.length} today`} trend={5} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard icon="bi-check-circle-fill" label="Completed Today" value={todayDone.length}  color="#12b76a" sub={`of ${todayAppts.length} scheduled`} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard icon="bi-bar-chart-fill"   label="Utilization"    value={`${utilization}%`} color="#7c3aed" sub="today's rate"
              trend={utilization > 70 ? 12 : -8} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard icon="bi-hourglass-split"  label="Avg Wait Time"  value={`${avgWait}m`}     color="#f79009" sub="estimated" />
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="row g-3">

          {/* ── Left: Tabs Panel ── */}
          <div className="col-12 col-xl-8">
            <div className="card fade-in" style={{ minHeight: 400 }}>

              {/* Tab Header */}
              <div className="card-header" style={{ padding: '0 !important' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '14px 16px',
                          background: 'none', border: 'none',
                          borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                          color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: activeTab === tab.key ? 700 : 500,
                          fontSize: 13, cursor: 'pointer',
                          transition: 'all 0.15s',
                          marginBottom: -1,
                        }}
                      >
                        <i className={`bi ${tab.icon}`} style={{ fontSize: 14 }} />
                        {tab.label}
                        {tab.count !== null && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-2)',
                            color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                            padding: '1px 7px', borderRadius: 20,
                          }}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    <i className="bi bi-arrow-clockwise me-1" />
                    {lastRefresh.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5 gap-3">
                    <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
                  </div>
                ) : (
                  <>
                    {/* Live Queue Tab */}
                    {activeTab === 'queue' && (
                      <div className="fade-in">
                        {waiting.length === 0 ? (
                          <div className="empty-state">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: 40, opacity: 1, color: 'var(--success)' }} />
                            <h6>Queue is clear!</h6>
                            <p>No patients waiting right now</p>
                          </div>
                        ) : (
                          waiting.map((a, i) => (
                            <QueueRow
                              key={a._id}
                              appt={a}
                              position={i + 1}
                              onComplete={(id) => handleStatus(id, 'completed')}
                              onNoShow={(id) => handleStatus(id, 'cancelled')}
                              onCancel={handleCancel}
                            />
                          ))
                        )}
                      </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                      <div className="fade-in">
                        <ScheduleTimeline
                          appointments={appointments}
                          today={today}
                          onComplete={(id) => handleStatus(id, 'completed')}
                          onNoShow={(id) => handleStatus(id, 'cancelled')}
                          onCancel={handleCancel}
                        />
                      </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                      <div className="fade-in table-responsive">
                        <table className="pro-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Patient</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.filter(a => a.status !== 'waiting').length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No history yet</td></tr>
                            ) : (
                              appointments
                                .filter(a => a.status !== 'waiting')
                                .map((a, i) => (
                                  <tr key={a._id}>
                                    <td style={{ color: 'var(--text-light)', fontSize: 12, fontWeight: 600 }}>{i + 1}</td>
                                    <td>
                                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.patient?.name}</div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.date}</td>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>{a.timeSlot}</td>
                                    <td>{STATUS_BADGE[a.status]}</td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Summary Panel ── */}
          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-3">

              {/* Today's Progress */}
              <div className="card scale-in">
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-calendar-check-fill me-2" style={{ color: 'var(--primary)' }} />
                    Today's Progress
                  </div>
                  <div className="card-subtitle-text">{today}</div>
                </div>
                <div className="card-body">
                  {[
                    { label: 'Total Scheduled', value: todayAppts.length,  color: 'var(--primary)', icon: 'bi-calendar3' },
                    { label: 'Completed',        value: todayDone.length,   color: 'var(--success)', icon: 'bi-check-circle-fill' },
                    { label: 'Waiting',          value: todayWait.length,   color: 'var(--warning)', icon: 'bi-clock-fill' },
                    { label: 'Cancelled',        value: todayAppts.filter(a => a.status === 'cancelled').length, color: 'var(--danger)', icon: 'bi-x-circle-fill' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 14 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}

                  {/* Progress bar */}
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Completion Rate</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: utilization >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{
                        width: `${utilization}%`,
                        background: utilization >= 70 ? 'var(--success)' : utilization >= 40 ? 'var(--warning)' : 'var(--danger)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="card scale-in" style={{ animationDelay: '0.08s' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
                        Availability Status
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {isAvailable ? 'Accepting new patients' : 'Not accepting patients'}
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <div
                      onClick={handleToggle}
                      style={{
                        width: 48, height: 26, borderRadius: 13,
                        background: isAvailable ? 'var(--success)' : 'var(--border-2)',
                        position: 'relative', cursor: 'pointer',
                        transition: 'background 0.25s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute', top: 3,
                        left: isAvailable ? 25 : 3,
                        transition: 'left 0.25s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>

                  <div style={{
                    marginTop: 14, padding: '10px 12px', borderRadius: 8,
                    background: isAvailable ? 'var(--success-light)' : 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <i className={`bi ${isAvailable ? 'bi-circle-fill' : 'bi-circle'}`}
                      style={{ fontSize: 8, color: isAvailable ? 'var(--success)' : 'var(--text-light)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: isAvailable ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isAvailable ? 'You are online and visible to patients' : 'You are offline — hidden from patients'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card scale-in" style={{ animationDelay: '0.12s' }}>
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-graph-up me-2" style={{ color: 'var(--purple)' }} />
                    Overall Stats
                  </div>
                </div>
                <div className="card-body">
                  {[
                    { label: 'Total Appointments', value: appointments.length },
                    { label: 'Total Completed',    value: appointments.filter(a => a.status === 'completed').length },
                    { label: 'Total Cancelled',    value: appointments.filter(a => a.status === 'cancelled').length },
                    { label: 'Currently Waiting',  value: waiting.length },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
                    </div>
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
