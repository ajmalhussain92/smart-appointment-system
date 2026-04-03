import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.nav}>
        <div style={styles.navBrand}>🏥 SmartDoc</div>
        <Link to={user ? '/dashboard' : '/login'} style={styles.navBtn}>
          {user ? 'Go to Dashboard →' : 'Sign In →'}
        </Link>
      </div>

      <div style={styles.hero}>
        <div style={styles.heroBadge}>🏆 Hackathon Project — HealthTech</div>
        <h1 style={styles.heroTitle}>
          Smart Appointment<br />
          <span style={styles.heroAccent}>Scheduling System</span>
        </h1>
        <p style={styles.heroSub}>
          An intelligent appointment management system that optimizes scheduling,
          reduces patient waiting time, and improves operational efficiency.
        </p>
        <div style={styles.heroActions}>
          <Link to={user ? '/dashboard' : '/login'} style={styles.primaryBtn}>
            {user ? 'Open Dashboard' : 'Get Started'} →
          </Link>
        </div>
      </div>

      <div style={styles.features}>
        {[
          { icon: '⏱️', title: 'Real-time Queue', desc: 'Live queue position and estimated waiting time for every patient.' },
          { icon: '📊', title: 'Doctor Analytics', desc: 'Track utilization, completion rates, and workload distribution.' },
          { icon: '🔔', title: 'Smart Alerts', desc: 'Automatic no-show detection and appointment reminders.' },
          { icon: '🗓️', title: 'Slot Management', desc: 'Prevent double booking with intelligent slot conflict detection.' },
          { icon: '👥', title: 'Role-based Access', desc: 'Separate dashboards for doctors and patients.' },
          { icon: '⚡', title: 'Auto Refresh', desc: 'Dashboard updates every 30 seconds automatically.' },
        ].map(f => (
          <div key={f.title} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <div style={styles.featureTitle}>{f.title}</div>
            <div style={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#fff' },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 40px', borderBottom: '1px solid #e5e7eb',
  },
  navBrand: { fontSize: 18, fontWeight: 800, color: '#111827' },
  navBtn: {
    background: '#2563eb', color: '#fff', padding: '8px 20px',
    borderRadius: 8, fontWeight: 600, fontSize: 14,
  },
  hero: {
    maxWidth: 700, margin: '0 auto',
    padding: '80px 24px 60px', textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-block', background: '#eff6ff', color: '#2563eb',
    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    marginBottom: 24,
  },
  heroTitle: { fontSize: 52, fontWeight: 900, color: '#111827', lineHeight: 1.1, marginBottom: 20, letterSpacing: -2 },
  heroAccent: { color: '#2563eb' },
  heroSub: { fontSize: 17, color: '#6b7280', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' },
  heroActions: { display: 'flex', justifyContent: 'center', gap: 12 },
  primaryBtn: {
    background: '#2563eb', color: '#fff', padding: '13px 28px',
    borderRadius: 8, fontWeight: 700, fontSize: 15,
  },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 1, background: '#e5e7eb',
    borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb',
  },
  featureCard: {
    background: '#fff', padding: '32px 28px',
  },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  featureTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 },
  featureDesc: { fontSize: 13.5, color: '#6b7280', lineHeight: 1.6 },
};
