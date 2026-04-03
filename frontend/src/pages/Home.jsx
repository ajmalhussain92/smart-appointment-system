import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Smart Doctor Appointment System</h1>
        <p style={styles.sub}>
          Book appointments, manage your queue, and track your health visits — all in one place.
        </p>
        <div style={styles.actions}>
          {user ? (
            <Link to="/dashboard" style={styles.primaryBtn}>Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" style={styles.primaryBtn}>Get Started</Link>
            </>
          )}
        </div>
      </div>

      <div style={styles.features}>
        {[
          { icon: '📅', title: 'Easy Booking', desc: 'Pick a doctor, choose a slot, done.' },
          { icon: '🔢', title: 'Live Queue', desc: 'See your real-time queue position.' },
          { icon: '✅', title: 'Status Tracking', desc: 'Track waiting, completed, cancelled.' },
        ].map((f) => (
          <div key={f.title} style={styles.featureCard}>
            <div style={styles.icon}>{f.icon}</div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  hero: { textAlign: 'center', padding: '60px 0 40px' },
  title: { fontSize: 36, fontWeight: 800, color: '#1a1a2e', marginBottom: 16 },
  sub: { fontSize: 18, color: '#555', maxWidth: 500, margin: '0 auto 32px' },
  actions: { display: 'flex', justifyContent: 'center', gap: 16 },
  primaryBtn: {
    background: '#1a73e8', color: '#fff', padding: '12px 28px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 16,
  },
  features: { display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' },
  featureCard: {
    background: '#fff', borderRadius: 12, padding: 24, width: 220,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center',
  },
  icon: { fontSize: 36, marginBottom: 12 },
  featureTitle: { fontWeight: 700, marginBottom: 8, color: '#1a1a2e' },
  featureDesc: { fontSize: 14, color: '#666' },
};
