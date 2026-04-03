import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';

export default function DoctorsPage({ onMenuToggle }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getAll().then(({ data }) => setDoctors(data)).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopHeader
        title="Find Doctors"
        subtitle="Home / Doctors"
        onMenuToggle={onMenuToggle}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
            <i className="bi bi-calendar-plus me-1" />Book Appointment
          </button>
        }
      />

      <div className="page-content">
        <div className="card fade-in">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div className="card-title-text">All Doctors</div>
              <div className="card-subtitle-text">{filtered.length} doctors registered</div>
            </div>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-search" style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: 13,
              }} />
              <input
                className="form-control"
                placeholder="Search by name or specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, width: 280 }}
              />
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <span className="ms-3" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading doctors...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-person-x" />
                <h6>No doctors found</h6>
                <p>Try a different search term</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc, i) => (
                      <tr key={doc._id}>
                        <td style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                              fontSize: 14, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, border: '1px solid rgba(59,130,246,0.2)',
                            }}>
                              {doc.name[0]}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>
                              Dr. {doc.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-status badge-doctor">
                            <i className="bi bi-award-fill" style={{ fontSize: 10 }} />
                            {doc.specialization || 'General'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{doc.email}</td>
                        <td>
                          <span className={`badge-status ${doc.isAvailable ? 'badge-available' : 'badge-busy'}`}>
                            <i className="bi bi-circle-fill" style={{ fontSize: 6 }} />
                            {doc.isAvailable ? ' Available' : ' Unavailable'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={!doc.isAvailable}
                            onClick={() => navigate('/book')}
                            style={{ fontSize: 12 }}
                          >
                            <i className="bi bi-calendar-plus me-1" />Book
                          </button>
                        </td>
                      </tr>
                    ))}
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
