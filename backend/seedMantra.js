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

const TODAY = new Date().toISOString().split('T')[0];

const SLOTS = [
  { timeSlot: '02:00 PM', type: 'in-person' },
  { timeSlot: '02:30 PM', type: 'online'    },
  { timeSlot: '03:00 PM', type: 'in-person' },
  { timeSlot: '03:30 PM', type: 'online'    },
  { timeSlot: '04:00 PM', type: 'in-person' },
];

async function seed() {
  try {
    const patients = await User.find({ role: 'patient' }).limit(5);
    if (patients.length === 0) {
      console.log('❌ No patients found! Run: node seed.js first');
      return mongoose.connection.close();
    }

    // Remove existing today appointments for Mantra
    await Appointment.deleteMany({ doctor: MANTRA_ID, date: TODAY });
    console.log(`🗑️  Cleared today's appointments for Dr. Mantra\n`);

    const appointments = SLOTS.map((s, i) => ({
      patient:       patients[i]._id,
      doctor:        new mongoose.Types.ObjectId(MANTRA_ID),
      date:          TODAY,
      timeSlot:      s.timeSlot,
      type:          s.type,
      status:        'pending',
      queuePosition: i + 1,
      notes:         '',
      reminderSent:  false,
    }));

    await Appointment.insertMany(appointments);

    console.log(`✅ 5 appointments created for Dr. Mantra Riziya\n`);
    console.log(`📅 Date: ${TODAY}`);
    console.log(`📊 Status: ALL PENDING — ready for actions!\n`);
    console.log('Queue:');
    SLOTS.forEach((s, i) => {
      console.log(`  #${i + 1} | ${s.timeSlot} | ${s.type.padEnd(10)} | ${patients[i].name} | pending`);
    });

    console.log('\n👨⚕️  Login as Mantra:');
    console.log('   riziyamantra@gmail.com / (your password)');
    console.log('\nActions available on each appointment:');
    console.log('   ✅ Confirm → confirmed');
    console.log('   ▶️  Start  → in-progress');
    console.log('   🏁 Complete → completed');
    console.log('   ❌ Cancel  → cancelled');
    console.log('   👻 No-show → no-show');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

seed();
