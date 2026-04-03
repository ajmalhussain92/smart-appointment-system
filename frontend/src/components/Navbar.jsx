import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🏥 SmartDoc</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            {user.role === 'patient' && (
              <Link to="/book" style={styles.link}>Book Appointment</Link>
            )}
            <span style={styles.name}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', background: '#1a73e8', color: '#fff',
  },
  brand: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 20 },
  links: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: '#fff', textDecoration: 'none' },
  name: { fontSize: 14, opacity: 0.85 },
  btn: {
    background: '#fff', color: '#1a73e8', border: 'none',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  },
};
