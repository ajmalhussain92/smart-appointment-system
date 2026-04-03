import { useAuth } from '../context/AuthContext';

export default function TopHeader({ title, subtitle, actions }) {
  const { user } = useAuth();

  return (
    <div className="top-header">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-breadcrumb">{subtitle}</div>}
      </div>
      <div className="header-actions">
        {actions}
        <span className={`badge ${user?.role === 'doctor' ? 'badge-doctor' : 'badge-patient'}`}>
          {user?.role === 'doctor' ? '👨⚕️ Doctor' : '🧑 Patient'}
        </span>
      </div>
    </div>
  );
}
