export default function Spinner({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #e5e7eb', borderTopColor: '#2563eb',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 13 }}>{text}</p>
    </div>
  );
}
