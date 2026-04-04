import { useState, useEffect } from 'react';

export default function NotificationBanner({ appointments }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!appointments?.length) return;
    const now = new Date();
    const newAlerts = [];

    appointments.forEach((a) => {
      if (a.status !== 'waiting') return;

      // Parse appointment datetime
      const [year, month, day] = a.date.split('-').map(Number);
      const [time, period] = a.timeSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const apptTime = new Date(year, month - 1, day, hours, minutes);
      const diffMins = (now - apptTime) / 60000;

      // Appointment was 15+ mins ago and still waiting = possible no-show
      if (diffMins > 15) {
        newAlerts.push({
          id: a._id,
          type: 'noshow',
          message: `⚠️ Appointment at ${a.timeSlot} is ${Math.floor(diffMins)} mins overdue — possible no-show`,
        });
      }
      // Appointment in next 30 mins = reminder
      else if (diffMins > -30 && diffMins <= 0) {
        newAlerts.push({
          id: a._id,
          type: 'reminder',
          message: `🔔 Upcoming appointment at ${a.timeSlot} — in ${Math.abs(Math.floor(diffMins))} mins`,
        });
      }
    });

    setAlerts(newAlerts);
  }, [appointments]);

  if (!alerts.length) return null;

  return (
    <div style={styles.container}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            ...styles.alert,
            background: alert.type === 'noshow' ? '#fef3c7' : '#dbeafe',
            borderLeft: `4px solid ${alert.type === 'noshow' ? '#f59e0b' : '#3b82f6'}`,
            color: alert.type === 'noshow' ? '#92400e' : '#1e40af',
          }}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { marginBottom: 20 },
  alert: {
    padding: '10px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, marginBottom: 8,
  },
};
