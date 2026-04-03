export default function TimeSlotPicker({ slots, bookedSlots, selected, onSelect }) {
  if (!slots) return null;

  return (
    <div style={styles.grid}>
      {slots.map((slot) => {
        const isBooked = bookedSlots?.includes(slot);
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            disabled={isBooked}
            onClick={() => onSelect(slot)}
            style={{
              ...styles.slot,
              background: isBooked ? '#f3f4f6' : isSelected ? '#1a73e8' : '#fff',
              color: isBooked ? '#9ca3af' : isSelected ? '#fff' : '#333',
              border: isSelected ? '2px solid #1a73e8' : '2px solid #e5e7eb',
              cursor: isBooked ? 'not-allowed' : 'pointer',
              textDecoration: isBooked ? 'line-through' : 'none',
            }}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  grid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  slot: {
    padding: '8px 14px', borderRadius: 8, fontSize: 13,
    fontWeight: 500, transition: 'all 0.15s',
  },
};
