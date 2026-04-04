require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const appointmentSchema = new mongoose.Schema({
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:          { type: String, required: true },
  timeSlot:      { type: String, required: true },
  type:          { type: String, enum: ['in-person', 'online'], default: 'in-person' },
  status:        { type: String, enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  queuePosition: { type: Number, required: true },
  notes:         { type: String, default: '' },
  reminderSent:  { type: Boolean, default: false },
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const userSchema = new mongoose.Schema({ name: String, email: String, role: String });

const Appointment = mongoose.model('Appointment', appointmentSchema);
const User        = mongoose.model('User', userSchema);

const DOCTOR_IDS = [
  { id: '69d06fe80fee9a99749cb811', name: 'Mantra Riziya',  spec: 'Neurologist'  },
  { id: '69d06f990fee9a99749cb800', name: 'Jenil Sarvaiya', spec: 'Cardiologist' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const NOTES = [
  'Take paracetamol 500mg twice daily after meals.',
  'Blood pressure normal. Continue current medication.',
  'Recommended MRI scan within 2 weeks.',
  'Advised complete bed rest for 3 days.',
  'Prescribed antibiotics for 5 days. Drink plenty of water.',
  'Follow-up required after 1 week.',
  'ECG results normal. Reduce salt intake.',
  'Vitamin D deficiency detected. Start supplements.',
];

const getDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

// Today's schedule — realistic flow for demo
const TODAY_SLOTS = [
  { slot: '09:00 AM', status: 'completed',   type: 'in-person', noteIdx: 0 },
  { slot: '09:30 AM', status: 'completed',   type: 'in-person', noteIdx: 1 },
  { slot: '10:00 AM', status: 'completed',   type: 'online',    noteIdx: 2 },
  { slot: '10:30 AM', status: 'no-show',     type: 'in-person', noteIdx: -1 },
  { slot: '11:00 AM', status: 'in-progress', type: 'in-person', noteIdx: -1 },
  { slot: '11:30 AM', status: 'confirmed',   type: 'online',    noteIdx: -1 },
  { slot: '02:00 PM', status: 'confirmed',   type: 'in-person', noteIdx: -1 },
  { slot: '02:30 PM', status: 'pending',     type: 'online',    noteIdx: -1 },
  { slot: '03:00 PM', status: 'pending',     type: 'in-person', noteIdx: -1 },
  { slot: '03:30 PM', status: 'cancelled',   type: 'in-person', noteIdx: -1 },
  { slot: '04:00 PM', status: 'pending',     type: 'online',    noteIdx: -1 },
  { slot: '04:30 PM', status: 'pending',     type: 'in-person', noteIdx: -1 },
];

// Tomorrow — mostly confirmed + pending
const TOMORROW_SLOTS = [
  { slot: '09:00 AM', status: 'confirmed', type: 'in-person', noteIdx: -1 },
  { slot: '09:30 AM', status: 'confirmed', type: 'online',    noteIdx: -1 },
  { slot: '10:00 AM', status: 'confirmed', type: 'in-person', noteIdx: -1 },
  { slot: '10:30 AM', status: 'pending',   type: 'online',    noteIdx: -1 },
  { slot: '11:00 AM', status: 'pending',   type: 'in-person', noteIdx: -1 },
  { slot: '11:30 AM', status: 'pending',   type: 'in-person', noteIdx: -1 },
  { slot: '02:00 PM', status: 'pending',   type: 'online',    noteIdx: -1 },
  { slot: '02:30 PM', status: 'pending',   type: 'in-person', noteIdx: -1 },
];

// Day after — all pending
const DAY_AFTER_SLOTS = [
  { slot: '09:00 AM', status: 'pending', type: 'in-person', noteIdx: -1 },
  { slot: '09:30 AM', status: 'pending', type: 'online',    noteIdx: -1 },
  { slot: '10:00 AM', status: 'pending', type: 'in-person', noteIdx: -1 },
  { slot: '10:30 AM', status: 'pending', type: 'online',    noteIdx: -1 },
  { slot: '11:00 AM', status: 'pending', type: 'in-person', noteIdx: -1 },
  { slot: '02:00 PM', status: 'pending', type: 'in-person', noteIdx: -1 },
];

async function seedAppointments() {
  try {
    const patients = await User.find({ role: 'patient' });
    if (patients.length === 0) {
      console.log('❌ No patients found! Run: node seed.js first');
      return mongoose.connection.close();
    }

    await Appointment.deleteMany({ doctor: { $in: DOCTOR_IDS.map((d) => d.id) } });
    console.log('🗑️  Cleared existing appointments\n');

    const allAppointments = [];
    let patientIdx = 0;

    const schedule = [
      { date: getDate(0),  slots: TODAY_SLOTS      },
      { date: getDate(1),  slots: TOMORROW_SLOTS   },
      { date: getDate(2),  slots: DAY_AFTER_SLOTS  },
    ];

    for (const doctor of DOCTOR_IDS) {
      console.log(`📅 Creating appointments for Dr. ${doctor.name} (${doctor.spec})`);

      for (const { date, slots } of schedule) {
        let queuePos = 1;
        for (const { slot, status, type, noteIdx } of slots) {
          const patient = patients[patientIdx % patients.length];
          allAppointments.push({
            patient:       patient._id,
            doctor:        new mongoose.Types.ObjectId(doctor.id),
            date,
            timeSlot:      slot,
            type,
            status,
            queuePosition: queuePos++,
            notes:         noteIdx >= 0 ? NOTES[noteIdx] : '',
            reminderSent:  status === 'completed',
          });
          patientIdx++;
        }
        console.log(`   ${date} — ${slots.length} appointments`);
      }
    }

    await Appointment.insertMany(allAppointments);

    console.log(`\n✅ ${allAppointments.length} total appointments created!\n`);

    // Stats summary
    const statuses = ['completed', 'in-progress', 'confirmed', 'pending', 'cancelled', 'no-show'];
    console.log('📊 Status breakdown:');
    for (const s of statuses) {
      const count = allAppointments.filter((a) => a.status === s).length;
      if (count > 0) console.log(`   ${s.padEnd(12)} → ${count}`);
    }

    console.log('\n👨‍⚕️  Demo Doctor Credentials:');
    console.log('   riziyamantra@gmail.com  / (their password)');
    console.log('   sarvaiyajenil0@gmail.com / (their password)');

    console.log('\n🧑‍💼 Demo Patient Credentials:');
    patients.slice(0, 5).forEach((p) => console.log(`   ${p.email} / password123`));

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

seedAppointments();
