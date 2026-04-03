export default function WaitingTimeBadge({ queuePosition, avgDuration = 15 }) {
  if (!queuePosition || queuePosition <= 0) return null;
  const estimatedMinutes = (queuePosition - 1) * avgDuration;
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;

  const label = estimatedMinutes === 0
    ? 'You are next!'
    : hours > 0
    ? `~${hours}h ${mins}m wait`
    : `~${mins} min wait`;

  const color = estimatedMinutes === 0 ? '#10b981'
    : estimatedMinutes <= 30 ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{ ...styles.badge, background: color + '18', color, border: `1px solid ${color}40` }}>
      🕐 {label}
    </div>
  );
}

const styles = {
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    marginTop: 6,
  },
};
