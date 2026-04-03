export default function Spinner({ text = 'Loading...' }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.ring} />
      <p style={styles.text}>{text}</p>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  ring: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #e5e7eb', borderTopColor: '#1a73e8',
    animation: 'spin 0.7s linear infinite',
  },
  text: { marginTop: 12, color: '#888', fontSize: 14 },
};
