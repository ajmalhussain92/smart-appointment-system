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

const MANTRA_ID = '69d06fe80fee9a99749cb811';

const getDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

// 8 new appointments — future dates taaki old se conflict na ho
const NEW_SLOTS = [
  { date: getDate(1), timeSlot: '09:00 AM', type: 'in-person' },
  { date: getDate(1), timeSlot: '09:30 AM', type: 'online'    },
  { date: getDate(1), timeSlot: '10:00 AM', type: 'in-person' },
  { date: getDate(1), timeSlot: '10:30 AM', type: 'online'    },
  { date: getDate(1), timeSlot: '11:00 AM', type: 'in-person' },
  { date: getDate(2), timeSlot: '09:00 AM', type: 'online'    },
  { date: getDate(2), timeSlot: '09:30 AM', type: 'in-person' },
  { date: getDate(2), timeSlot: '10:00 AM', type: 'online'    },
];

async function seed() {
  try {
    const patients = await User.find({ role: 'patient' });
    if (patients.length === 0) {
      console.log('❌ No patients found! Run: node seed.js first');
      return mongoose.connection.close();
    }

    // Check existing count — DO NOT DELETE
    const existing = await Appointment.find({ doctor: MANTRA_ID });
    console.log(`📋 Existing appointments for Dr. Mantra: ${existing.length} (keeping all)\n`);

    // Get existing slots to avoid conflict
    const existingSlots = existing.map((a) => `${a.date}_${a.timeSlot}`);

    const toInsert = [];
    let patientIdx = 0;

    for (const slot of NEW_SLOTS) {
      const key = `${slot.date}_${slot.timeSlot}`;
      if (existingSlots.includes(key)) {
        console.log(`⚠️  Skipping ${slot.date} ${slot.timeSlot} — already booked`);
        continue;
      }

      // Get next queue position for that date
      const queueCount = await Appointment.countDocuments({
        doctor: MANTRA_ID,
        date: slot.date,
        status: { $in: ['pending', 'confirmed', 'in-progress'] },
      });

      toInsert.push({
        patient:       patients[patientIdx % patients.length]._id,
        doctor:        new mongoose.Types.ObjectId(MANTRA_ID),
        date:          slot.date,
        timeSlot:      slot.timeSlot,
        type:          slot.type,
        status:        'pending',
        queuePosition: queueCount + toInsert.filter(a => a.date === slot.date).length + 1,
        notes:         '',
        reminderSent:  false,
      });
      patientIdx++;
    }

    if (toInsert.length === 0) {
      console.log('⚠️  All slots already booked!');
      return mongoose.connection.close();
    }

    await Appointment.insertMany(toInsert);

    console.log(`✅ ${toInsert.length} new appointments added for Dr. Mantra Riziya!\n`);
    console.log('New Inquiries (ALL PENDING — judge le sakta hai actions):');
    toInsert.forEach((a, i) => {
      const patient = patients.find(p => p._id.toString() === a.patient.toString());
      console.log(`  #${i+1} | ${a.date} | ${a.timeSlot} | ${a.type.padEnd(10)} | ${patient?.name || 'Patient'} | pending`);
    });

    const total = await Appointment.countDocuments({ doctor: MANTRA_ID });
    console.log(`\n📊 Total appointments for Dr. Mantra: ${total}`);
    console.log('\n👨⚕️  Login: riziyamantra@gmail.com / Mantra@143');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

seed();
