import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../api/services';
import TopHeader from '../components/TopHeader';
import Spinner from '../components/Spinner';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getAll()
      .then(({ data }) => setDoctors(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopHeader
        title="Find Doctors"
        subtitle="Browse available doctors and book appointments"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>
            + Book Appointment
          </button>
        }
      />

      <div className="page-body">
        <div className="card animate-fade">
          <div className="card-header">
            <div>
              <div className="card-title">All Doctors</div>
              <div className="card-subtitle">{filtered.length} doctors found</div>
            </div>
            <input
              className="form-input"
              placeholder="🔍 Search by name or specialization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          {loading ? <Spinner text="Loading doctors..." /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => (
                    <tr key={doc._id}>
                      <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#eff6ff', color: '#2563eb',
                            fontSize: 14, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {doc.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>Dr. {doc.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-doctor">{doc.specialization || 'General'}</span>
                      </td>
                      <td>
                        <span className={`badge ${doc.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                          {doc.isAvailable ? '● Available' : '● Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!doc.isAvailable}
                          onClick={() => navigate('/book')}
                        >
                          Book
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
  );
}
