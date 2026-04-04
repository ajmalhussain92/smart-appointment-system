require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  specialization: String,
  isAvailable: Boolean,
  offDays: [String],
  consultationType: [String],
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  timeSlot: String,
  type: { type: String, enum: ['in-person', 'online'] },
  status: { type: String, enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'] },
  queuePosition: Number,
  notes: String,
  reminderSent: Boolean,
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const getDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

async function seed() {
  try {
    console.log('🚀 Starting seed: 20 users + 40 appointments\n');

    // ═══ 1. CREATE 20 PATIENTS ═══
    console.log('👥 Creating 20 patients...');
    const patients = [];
    for (let i = 1; i <= 20; i++) {
      const hashedPwd = await bcrypt.hash('password123', 10);
      const patient = await User.create({
        name: `Patient ${i}`,
        email: `patient${i}@smartdoc.com`,
        password: hashedPwd,
        role: 'patient',
        isAvailable: true,
        offDays: [],
        consultationType: ['in-person', 'online'],
      }).catch(err => {
        if (err.code === 11000) return null; // Skip if exists
        throw err;
      });
      if (patient) patients.push(patient);
    }
    console.log(`✅ ${patients.length} patients created/found\n`);

    // ═══ 2. GET OR CREATE DOCTORS ═══
    console.log('👨⚕️  Getting doctors...');
    let doctors = await User.find({ role: 'doctor' });
    if (doctors.length === 0) {
      console.log('Creating 2 doctors...');
      const hashedPwd = await bcrypt.hash('password123', 10);
      doctors = await User.insertMany([
        {
          name: 'Dr. Mantra Riziya',
          email: 'mantra@smartdoc.com',
          password: hashedPwd,
          role: 'doctor',
          specialization: 'Cardiologist',
          isAvailable: true,
          offDays: [],
          consultationType: ['in-person', 'online'],
        },
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh@smartdoc.com',
          password: hashedPwd,
          role: 'doctor',
          specialization: 'Neurologist',
          isAvailable: true,
          offDays: [],
          consultationType: ['in-person', 'online'],
        },
      ]);
    }
    console.log(`✅ ${doctors.length} doctors found\n`);

    // ═══ 3. CREATE 40 APPOINTMENTS ═══
    console.log('📅 Creating 40 appointments...');
    const appointments = [];
    let patientIdx = 0;

    // Distribute 40 appointments across 2 doctors, 5 days, multiple slots
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const date = getDate(dayOffset);
      
      for (let doctorIdx = 0; doctorIdx < doctors.length; doctorIdx++) {
        const doctor = doctors[doctorIdx];
        
        // 4 appointments per doctor per day = 8 per day × 5 days = 40 total
        for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
          const timeSlot = TIME_SLOTS[slotIdx * 3]; // Use every 3rd slot
          const type = slotIdx % 2 === 0 ? 'in-person' : 'online';
          
          const queueCount = appointments.filter(
            a => a.doctor.toString() === doctor._id.toString() && a.date === date
          ).length;

          appointments.push({
            patient: patients[patientIdx % patients.length]._id,
            doctor: doctor._id,
            date,
            timeSlot,
            type,
            status: ['pending', 'confirmed', 'in-progress'][Math.floor(Math.random() * 3)],
            queuePosition: queueCount + 1,
            notes: `Appointment for ${patients[patientIdx % patients.length].name}`,
            reminderSent: false,
          });
          patientIdx++;
        }
      }
    }

    // Insert appointments
    await Appointment.deleteMany({}); // Clear old appointments
    await Appointment.insertMany(appointments);
    console.log(`✅ ${appointments.length} appointments created\n`);

    // ═══ 4. DISPLAY SUMMARY ═══
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SEED SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('👥 PATIENTS (20):');
    patients.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.email})`);
    });
    console.log(`  ... and ${patients.length - 5} more\n`);

    console.log('👨⚕️  DOCTORS:');
    doctors.forEach((d, i) => {
      console.log(`  ${i + 1}. Dr. ${d.name} - ${d.specialization}`);
      console.log(`     Email: ${d.email}`);
    });
    console.log();

    console.log('📅 APPOINTMENTS (40):');
    const apptsByDoctor = {};
    appointments.forEach(a => {
      const docName = doctors.find(d => d._id.toString() === a.doctor.toString())?.name || 'Unknown';
      apptsByDoctor[docName] = (apptsByDoctor[docName] || 0) + 1;
    });
    Object.entries(apptsByDoctor).forEach(([doc, count]) => {
      console.log(`  ${doc}: ${count} appointments`);
    });
    console.log();

    console.log('📈 STATUS BREAKDOWN:');
    const statusCount = {};
    appointments.forEach(a => {
      statusCount[a.status] = (statusCount[a.status] || 0) + 1;
    });
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SEED COMPLETE!\n');
    console.log('🔐 Demo Credentials:');
    console.log('  Patient: patient1@smartdoc.com / password123');
    console.log('  Doctor:  mantra@smartdoc.com / password123\n');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

seed();
