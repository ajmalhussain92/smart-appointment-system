import { useAuth } from '../context/AuthContext';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  // key={user._id} forces full remount when user changes — clears stale data
  return user.role === 'doctor'
    ? <DoctorDashboard key={user._id} />
    : <PatientDashboard key={user._id} />;
}
