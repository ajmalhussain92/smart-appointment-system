require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true },
  role:             { type: String, enum: ['doctor', 'patient'], required: true },
  specialization:   { type: String, trim: true },
  isAvailable:      { type: Boolean, default: true },
  offDays:          { type: [String], default: [] },
  consultationType: { type: [String], default: ['in-person'] },
  resetOtp:         { type: String },
  resetOtpExpiry:   { type: Date },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const DOCTOR_NAMES = ['Ayesha', 'Rajesh', 'Priya', 'Arjun', 'Neha', 'Vikram', 'Sneha', 'Rohan', 'Divya', 'Aditya'];
const PATIENT_NAMES = ['Ali', 'Zara', 'Hassan', 'Fatima', 'Omar', 'Layla', 'Ahmed', 'Noor', 'Karim', 'Amira'];
const SPECIALIZATIONS = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics'];

async function seed() {
  try {
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const hashed = await bcrypt.hash('password123', 10);
    const doctors = [];
    const patients = [];

    for (let i = 0; i < 10; i++) {
      doctors.push({
        name:             `Dr. ${DOCTOR_NAMES[i]}`,
        email:            `doctor${i + 1}@smartdoc.com`,
        password:         hashed,
        role:             'doctor',
        specialization:   SPECIALIZATIONS[i % 5],
        isAvailable:      true,
        consultationType: ['in-person', 'online'],
        offDays:          [],
      });
    }

    for (let i = 0; i < 10; i++) {
      patients.push({
        name:     `Patient ${PATIENT_NAMES[i]}`,
        email:    `patient${i + 1}@smartdoc.com`,
        password: hashed,
        role:     'patient',
      });
    }

    await User.insertMany([...doctors, ...patients]);

    console.log('✅ 20 users created (10 doctors + 10 patients)\n');
    console.log('Doctor Credentials:');
    doctors.forEach((d) => console.log(`  ${d.email} / password123`));
    console.log('\nPatient Credentials:');
    patients.forEach((p) => console.log(`  ${p.email} / password123`));

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

seed();
