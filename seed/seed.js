/**
 * Dummy Data Seed Script
 * Run: node seed/seed.js
 * Make sure MongoDB is running and backend .env has MONGO_URI
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-appointments';

// ─── Schemas (inline so no backend dependency) ───────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['doctor', 'patient'] },
  specialization: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  timeSlot: String,
  status: { type: String, enum: ['waiting', 'completed', 'cancelled', 'no-show'], default: 'waiting' },
  queuePosition: Number,
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const User        = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DOCTORS = [
  { name: 'Dr. Ayesha Khan',    email: 'ayesha@smartdoc.com',  specialization: 'Cardiologist',    isAvailable: true  },
  { name: 'Dr. Bilal Ahmed',    email: 'bilal@smartdoc.com',   specialization: 'Neurologist',     isAvailable: true  },
  { name: 'Dr. Sara Malik',     email: 'sara@smartdoc.com',    specialization: 'Dermatologist',   isAvailable: true  },
  { name: 'Dr. Usman Tariq',    email: 'usman@smartdoc.com',   specialization: 'Orthopedic',      isAvailable: false },
  { name: 'Dr. Fatima Zahra',   email: 'fatima@smartdoc.com',  specialization: 'Pediatrician',    isAvailable: true  },
];

const PATIENTS = [
  { name: 'Ali Hassan',     email: 'ali@patient.com'     },
  { name: 'Zara Sheikh',    email: 'zara@patient.com'    },
  { name: 'Omar Farooq',    email: 'omar@patient.com'    },
  { name: 'Hina Butt',      email: 'hina@patient.com'    },
  { name: 'Kamran Iqbal',   email: 'kamran@patient.com'  },
  { name: 'Nadia Hussain',  email: 'nadia@patient.com'   },
  { name: 'Tariq Mehmood',  email: 'tariq@patient.com'   },
  { name: 'Sana Javed',     email: 'sana@patient.com'    },
];

const SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

// Dates: today, tomorrow, day after
const today    = new Date();
const dates    = [0, 1, 2].map(offset => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
});

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clear existing data
  await User.deleteMany({});
  await Appointment.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Insert doctors
  const doctors = await User.insertMany(
    DOCTORS.map(d => ({ ...d, password: hashedPassword, role: 'doctor' }))
  );
  console.log(`👨‍⚕️  Inserted ${doctors.length} doctors`);

  // Insert patients
  const patients = await User.insertMany(
    PATIENTS.map(p => ({ ...p, password: hashedPassword, role: 'patient' }))
  );
  console.log(`🧑‍🤝‍🧑 Inserted ${patients.length} patients`);

  // Insert appointments
  const appointments = [];
  const usedSlots = new Set(); // track (doctorId, date, slot) to avoid duplicates

  const statuses = ['waiting', 'waiting', 'waiting', 'completed', 'completed', 'cancelled', 'no-show'];

  let slotIndex = 0;
  for (const doctor of doctors) {
    for (const date of dates) {
      // 3-5 appointments per doctor per day
      const count = 3 + Math.floor(Math.random() * 3);
      let queuePos = 1;

      for (let i = 0; i < count; i++) {
        const slot = SLOTS[slotIndex % SLOTS.length];
        slotIndex++;

        const key = `${doctor._id}-${date}-${slot}`;
        if (usedSlots.has(key)) continue;
        usedSlots.add(key);

        const patient  = patients[Math.floor(Math.random() * patients.length)];
        const status   = date === dates[0]
          ? statuses[Math.floor(Math.random() * statuses.length)]  // today: mixed
          : 'waiting'; // future: all waiting

        appointments.push({
          patient:       patient._id,
          doctor:        doctor._id,
          date,
          timeSlot:      slot,
          status,
          queuePosition: queuePos++,
        });
      }
    }
  }

  await Appointment.insertMany(appointments);
  console.log(`📅 Inserted ${appointments.length} appointments`);

  // Print login credentials
  console.log('\n─────────────────────────────────────────');
  console.log('🔑 LOGIN CREDENTIALS (all passwords: password123)');
  console.log('─────────────────────────────────────────');
  console.log('\n👨‍⚕️  DOCTORS:');
  DOCTORS.forEach(d => console.log(`   ${d.email}  |  ${d.specialization}`));
  console.log('\n🧑  PATIENTS:');
  PATIENTS.forEach(p => console.log(`   ${p.email}`));
  console.log('\n─────────────────────────────────────────');
  console.log('✅ Seed complete! Run backend and test.\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
