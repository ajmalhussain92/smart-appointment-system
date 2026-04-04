import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorStats, setDoctorStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const params = {};
    if (availableOnly) params.available = true;
    if (typeFilter !== 'all') params.type = typeFilter;

    Promise.all([
      doctorAPI.getAll(params),
      doctorAPI.getRankings().catch(() => ({ data: {} })),
    ])
    .then(([{ data: doctorsData }, { data: rankingsData }]) => {
      setDoctors(doctorsData);
      setDoctorStats(rankingsData);
    })
    .finally(() => setLoading(false));
  }, [availableOnly, typeFilter]);

  const filtered = doctors
    .map(d => ({ ...d, stats: doctorStats[d._id] || { total: 0, completed: 0, noShow: 0, rating: null } }))
    .sort((a, b) => {
      // null rating (no data) goes to bottom
      if (a.stats.rating === null && b.stats.rating === null) return 0;
      if (a.stats.rating === null) return 1;
      if (b.stats.rating === null) return -1;
      return b.stats.rating - a.stats.rating;
    })
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(search.toLowerCase())
    );

  const isDoctorOffToday = (doc) => doc.offDays?.includes(today);

  const getRankBadge = (rating) => {
    if (rating === null) return { label: 'New', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
    if (rating >= 90)   return { label: '★★★★★', color: '#12b76a', bg: 'rgba(18,183,106,0.12)' };
    if (rating >= 75)   return { label: '★★★★',  color: '#059669', bg: 'rgba(5,150,105,0.12)'  };
    if (rating >= 60)   return { label: '★★★',   color: '#f79009', bg: 'rgba(247,144,9,0.12)'  };
    if (rating >= 40)   return { label: '★★',    color: '#f97316', bg: 'rgba(249,115,22,0.12)' };
    return                     { label: '★',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  };
  };

  return (
    <div>
      <TopHeader
        title="Find Doctors"
        subtitle="Home / Doctors"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
            <i className="bi bi-calendar-plus me-1" />Book Appointment
          </button>
        }
      />

      <div className="page-content">
        <div className="card fade-in">

          {/* Filter Bar */}
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <div className="card-title-text">All Doctors</div>
                <div className="card-subtitle-text">{filtered.length} doctors found</div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }} />
                  <input className="form-control" placeholder="Search specialization..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 32, width: 220 }} />
                </div>

                {/* Type filter */}
                <div className="d-flex gap-1">
                  {['all', 'in-person', 'online'].map(t => (
                    <button key={t} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setTypeFilter(t)} style={{ fontSize: 11, textTransform: 'capitalize' }}>
                      {t === 'all' ? 'All' : t === 'in-person' ? <><i className="bi bi-hospital me-1" />In-Person</> : <><i className="bi bi-camera-video me-1" />Online</>}
                    </button>
                  ))}
                </div>

                {/* Available toggle */}
                <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => setAvailableOnly(o => !o)}>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: availableOnly ? 'var(--success)' : 'var(--border-2)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, left: availableOnly ? 19 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  Available only
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5 gap-3">
                <div className="spinner-border text-primary" style={{ width: 26, height: 26, borderWidth: 3 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading doctors...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-person-x" />
                <h6>No doctors found</h6>
                <p>Try different filters</p>
              </div>
            ) : (
              <div className="table-fixed-wrap">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Type</th>
                      <th>Ranking</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc, i) => {
                      const offToday = isDoctorOffToday(doc);
                      const rank = getRankBadge(doc.stats.rating);
                      return (
                        <tr key={doc._id}>
                          <td style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                                color: '#fff', fontSize: 13, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {doc.name[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Dr. {doc.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-status badge-doctor">
                              <i className="bi bi-award-fill" style={{ fontSize: 10 }} /> {doc.specialization || 'General'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {(doc.consultationType || ['in-person']).map(t => (
                                <span key={t} className="badge-status" style={{
                                  background: t === 'online' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                                  color: t === 'online' ? '#6366f1' : '#059669', fontSize: 10,
                                }}>
                                  <i className={`bi ${t === 'online' ? 'bi-camera-video-fill' : 'bi-hospital-fill'}`} style={{ fontSize: 9 }} />
                                  {t === 'online' ? 'Online' : 'In-Person'}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                background: rank.bg,
                                color: rank.color,
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }}>
                                {rank.label}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {doc.stats.rating !== null
                                  ? `${doc.stats.rating}% (${doc.stats.completed}/${doc.stats.total})`
                                  : 'No data yet'}
                              </span>
                            </div>
                          </td>
                          <td>
                            {offToday ? (
                              <span className="badge-status badge-cancelled">
                                <i className="bi bi-calendar-x-fill" style={{ fontSize: 9 }} /> Off Today
                              </span>
                            ) : (
                              <span className={`badge-status ${doc.isAvailable ? 'badge-available' : 'badge-busy'}`}>
                                <i className="bi bi-circle-fill" style={{ fontSize: 6 }} />
                                {doc.isAvailable ? ' Available' : ' Unavailable'}
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={!doc.isAvailable || offToday}
                              onClick={() => navigate('/book', { state: { doctor: doc } })}
                              style={{ fontSize: 12 }}
                              title={offToday ? 'Doctor is off today' : !doc.isAvailable ? 'Doctor unavailable' : 'Book'}
                            >
                              <i className="bi bi-calendar-plus me-1" />Book
                            </button>
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
