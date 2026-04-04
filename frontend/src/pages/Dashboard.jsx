import { useAuth } from '../context/AuthContext';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />;
}
