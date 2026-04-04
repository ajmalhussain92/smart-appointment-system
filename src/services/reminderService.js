const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Appointment = require('../models/Appointment');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const slotToMinutes = (slot) => {
  const [time, period] = slot.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const sendReminders = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const appointments = await Appointment.find({
      date: today,
      status: 'waiting',
      reminderSent: false,
    }).populate('patient', 'name email').populate('doctor', 'name specialization');

    for (const appt of appointments) {
      const slotMinutes = slotToMinutes(appt.timeSlot);
      const diff = slotMinutes - nowMinutes;

      // Send reminder 60 mins before
      if (diff > 0 && diff <= 60) {
        await transporter.sendMail({
          from: `"SmartDoc" <${process.env.EMAIL_USER}>`,
          to: appt.patient.email,
          subject: 'SmartDoc — Appointment Reminder',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">⏰ Appointment Reminder</h2>
              <p>Hi <strong>${appt.patient.name}</strong>,</p>
              <p>Your appointment is in <strong>~${diff} minutes</strong>.</p>
              <table style="width:100%; background:#eff6ff; border-radius:8px; padding:16px; margin:16px 0;">
                <tr><td><strong>Doctor:</strong></td><td>Dr. ${appt.doctor.name}</td></tr>
                <tr><td><strong>Specialization:</strong></td><td>${appt.doctor.specialization}</td></tr>
                <tr><td><strong>Date:</strong></td><td>${appt.date}</td></tr>
                <tr><td><strong>Time:</strong></td><td>${appt.timeSlot}</td></tr>
                <tr><td><strong>Type:</strong></td><td>${appt.type}</td></tr>
              </table>
              <p style="color:#666;">Please be on time. Good luck!</p>
            </div>
          `,
        });

        appt.reminderSent = true;
        await appt.save();
        console.log(`Reminder sent to ${appt.patient.email} for ${appt.timeSlot}`);
      }
    }
  } catch (err) {
    console.error('Reminder error:', err.message);
  }
};

// Run every 5 minutes
const startReminderJob = () => {
  cron.schedule('*/5 * * * *', sendReminders);
  console.log('Reminder job started');
};

module.exports = { startReminderJob };
