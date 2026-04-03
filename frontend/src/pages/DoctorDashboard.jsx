import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import { subscribeToQueue, unsubscribeFromQueue } from '../api/socket';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ── Custom Tooltip ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-md)',
      fontSize: 12,
    }}>
      {label && <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── Queue Row ────────────────────────────────────────────
function QueueRow({ appt, position, onComplete, onNoShow, onCancel }) {
  const waitMins = (position - 1) * 15;
  const isNext = position === 1;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
      background: isNext ? 'var(--primary-light)' : 'transparent',
      borderBottom: '1px solid var(--border)', transition: 'background 0.2s',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: isNext ? 'var(--primary)' : 'var(--surface-2)',
        color: isNext ? '#fff' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, border: isNext ? 'none' : '1px solid var(--border)',
      }}>
        {isNext ? <i className="bi bi-person-fill" style={{ fontSize: 13 }} /> : position}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {appt.patient?.name}
          {isNext && <span style={{ fontSize: 9, background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>NEXT</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          <i className="bi bi-clock me-1" />{appt.timeSlot}
          {waitMins > 0 && <span style={{ marginLeft: 8, color: waitMins > 30 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>~{waitMins}m wait</span>}
          {waitMins === 0 && <span style={{ marginLeft: 8, color: 'var(--success)', fontWeight: 600 }}>Ready now</span>}
        </div>
      </div>
      <div className="d-flex gap-1">
        <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
          onClick={() => onComplete(appt._id)} title="Complete">
          <i className="bi bi-check-lg" />
        </button>
        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
          onClick={() => onNoShow(appt._id)} title="No Show">
          <i className="bi bi-person-dash" />
        </button>
        <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}
          onClick={() => onCancel(appt._id)} title="Cancel">
          <i className="bi bi-x-lg" />
        </button>
      </div>
    </div>
  );
}

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

  // ── Computed Data ────────────────────────────────────
  const todayAppts  = appointments.filter(a => a.date === today);
  const waiting     = appointments.filter(a => a.status === 'waiting');
  const todayDone   = todayAppts.filter(a => a.status === 'completed');
  const utilization = todayAppts.length > 0 ? Math.round((todayDone.length / todayAppts.length) * 100) : 0;

  // Donut chart data
  const donutData = [
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#12b76a' },
    { name: 'Waiting',   value: waiting.length,   color: '#3b82f6' },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#f04438' },
    { name: 'No-Show',   value: appointments.filter(a => a.status === 'no-show').length,   color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Hourly bar chart — today's appointments by time slot
  const SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];
  const hourlyData = SLOTS.map(slot => ({
    slot: slot.replace(' AM','a').replace(' PM','p'),
    Booked: todayAppts.filter(a => a.timeSlot === slot).length,
    Available: todayAppts.filter(a => a.timeSlot === slot).length === 0 ? 1 : 0,
  }));

  // Weekly area chart — last 7 days appointments
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayAppts = appointments.filter(a => a.date === dateStr);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      Total: dayAppts.length,
      Completed: dayAppts.filter(a => a.status === 'completed').length,
      Waiting: dayAppts.filter(a => a.status === 'waiting').length,
    };
  });

  const tabs = [
    { key: 'queue',    label: 'Live Queue',     icon: 'bi-people-fill',    count: waiting.length },
    { key: 'charts',   label: 'Analytics',      icon: 'bi-bar-chart-fill', count: null },
    { key: 'schedule', label: 'Today Schedule', icon: 'bi-calendar3',      count: todayAppts.length },
  ];

  const stats = [
    { icon: 'bi-people-fill',       label: 'In Queue',        value: waiting.length,    color: '#3b82f6', bg: 'var(--primary-light)' },
    { icon: 'bi-check-circle-fill', label: 'Completed Today', value: todayDone.length,  color: '#12b76a', bg: 'var(--success-light)' },
    { icon: 'bi-bar-chart-fill',    label: 'Utilization',     value: `${utilization}%`, color: '#7c3aed', bg: 'var(--purple-light)' },
    { icon: 'bi-calendar3',         label: 'Total All Time',  value: appointments.length, color: '#f79009', bg: 'var(--warning-light)' },
  ];

  return (
    <div>
      <TopHeader
        title="Doctor Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <button className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
            onClick={handleToggle} style={{ fontSize: 12 }}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: 7 }} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
        }
      />

      <div className="page-content">

        {/* ── Stats ── */}
        <div className="row g-2 mb-2">
          {stats.map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="stat-card slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon-box" style={{ background: s.bg }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
                </div>
                <div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="row g-2">

          {/* ── Left: Tabs ── */}
          <div className="col-12 col-xl-8">
            <div className="card fade-in">

              {/* Tab Header */}
              <div className="card-header" style={{ padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                  <div style={{ display: 'flex' }}>
                    {tabs.map(tab => (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '13px 14px', background: 'none', border: 'none',
                        borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
                      }}>
                        <i className={`bi ${tab.icon}`} style={{ fontSize: 13 }} />
                        {tab.label}
                        {tab.count !== null && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                            background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-2)',
                            color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                          }}>{tab.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    <i className="bi bi-arrow-clockwise me-1" />{lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5 gap-3">
                    <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
                  </div>
                ) : (
                  <>
                    {/* ── Live Queue ── */}
                    {activeTab === 'queue' && (
                      <div className="fade-in">
                        {waiting.length === 0 ? (
                          <div className="empty-state">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: 36, opacity: 1, color: 'var(--success)' }} />
                            <h6>Queue is clear!</h6>
                            <p>No patients waiting right now</p>
                          </div>
                        ) : waiting.map((a, i) => (
                          <QueueRow key={a._id} appt={a} position={i + 1}
                            onComplete={id => handleStatus(id, 'completed')}
                            onNoShow={id => handleStatus(id, 'cancelled')}
                            onCancel={handleCancel} />
                        ))}
                      </div>
                    )}

                    {/* ── Analytics Charts ── */}
                    {activeTab === 'charts' && (
                      <div className="fade-in" style={{ padding: 16 }}>

                        {/* Weekly Trend */}
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                            <i className="bi bi-graph-up me-2" style={{ color: 'var(--primary)' }} />
                            Weekly Appointment Trend
                          </div>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#12b76a" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#12b76a" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Area type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTotal)" />
                              <Area type="monotone" dataKey="Completed" stroke="#12b76a" strokeWidth={2} fill="url(#colorDone)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Hourly Distribution */}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                            <i className="bi bi-clock-history me-2" style={{ color: 'var(--warning)' }} />
                            Today's Hourly Slot Distribution
                          </div>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="slot" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="Booked" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* ── Today Schedule ── */}
                    {activeTab === 'schedule' && (
                      <div className="fade-in">
                        {todayAppts.length === 0 ? (
                          <div className="empty-state">
                            <i className="bi bi-calendar-x" />
                            <h6>No appointments today</h6>
                          </div>
                        ) : todayAppts.map((a, i) => (
                          <div key={a._id} style={{
                            display: 'flex', gap: 0,
                            borderBottom: i < todayAppts.length - 1 ? '1px solid var(--border)' : 'none',
                          }}>
                            <div style={{ width: 72, flexShrink: 0, padding: '13px 12px', borderRight: '1px solid var(--border)', textAlign: 'right' }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.timeSlot.split(' ')[0]}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.timeSlot.split(' ')[1]}</div>
                            </div>
                            <div style={{ flex: 1, padding: '11px 14px', background: a.status === 'waiting' && a.queuePosition === 1 ? 'var(--primary-light)' : 'transparent' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{a.patient?.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Queue #{a.queuePosition}</div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className={`badge-status badge-${a.status}`}>{a.status}</span>
                                  {a.status === 'waiting' && (
                                    <button className="btn btn-success btn-sm" style={{ fontSize: 10, padding: '2px 8px' }}
                                      onClick={() => handleStatus(a._id, 'completed')}>
                                      <i className="bi bi-check-lg" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-2">

              {/* Donut Chart */}
              <div className="card scale-in">
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-pie-chart-fill me-2" style={{ color: 'var(--purple)' }} />
                    Appointment Status
                  </div>
                  <div className="card-subtitle-text">All time breakdown</div>
                </div>
                <div className="card-body">
                  {donutData.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No data yet</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                            paddingAngle={3} dataKey="value">
                            {donutData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                        {donutData.map(d => (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Today Progress */}
              <div className="card scale-in" style={{ animationDelay: '0.08s' }}>
                <div className="card-header">
                  <div className="card-title-text">
                    <i className="bi bi-calendar-check-fill me-2" style={{ color: 'var(--primary)' }} />
                    Today's Progress
                  </div>
                  <div className="card-subtitle-text">{today}</div>
                </div>
                <div className="card-body">
                  {[
                    { label: 'Scheduled', value: todayAppts.length,  color: 'var(--primary)' },
                    { label: 'Completed', value: todayDone.length,   color: 'var(--success)' },
                    { label: 'Waiting',   value: todayAppts.filter(a => a.status === 'waiting').length, color: 'var(--warning)' },
                    { label: 'Cancelled', value: todayAppts.filter(a => a.status === 'cancelled').length, color: 'var(--danger)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Completion Rate</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: utilization >= 70 ? 'var(--success)' : 'var(--warning)' }}>{utilization}%</span>
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

              {/* Availability */}
              <div className="card scale-in" style={{ animationDelay: '0.12s' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>Availability</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {isAvailable ? 'Accepting patients' : 'Not accepting'}
                      </div>
                    </div>
                    <div onClick={handleToggle} style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: isAvailable ? 'var(--success)' : 'var(--border-2)',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: isAvailable ? 23 : 3,
                        transition: 'left 0.25s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
