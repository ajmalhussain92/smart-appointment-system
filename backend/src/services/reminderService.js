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
      status: { $in: ['pending', 'confirmed'] },
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
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e4e7ec;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:28px 32px;text-align:center;">
                <div style="font-size:32px;margin-bottom:8px;">⏰</div>
                <h2 style="color:#fff;margin:0;font-size:20px;font-weight:800;">Appointment Reminder</h2>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">SmartDoc — Smart Appointment System</p>
              </div>
              <div style="padding:28px 32px;background:#fff;">
                <p style="font-size:15px;color:#101828;margin-bottom:20px;">Hi <strong>${appt.patient.name}</strong>, your appointment is in <strong style="color:#3b82f6;">~${diff} minutes</strong>. Please be ready!</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr style="background:#f8f9fb;"><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.5px;border-radius:8px 0 0 0;">Doctor</td><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#101828;">Dr. ${appt.doctor.name}</td></tr>
                  <tr><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.5px;">Specialization</td><td style="padding:10px 14px;font-size:13px;color:#344054;">${appt.doctor.specialization || 'General'}</td></tr>
                  <tr style="background:#f8f9fb;"><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.5px;">Date</td><td style="padding:10px 14px;font-size:13px;color:#344054;">${appt.date}</td></tr>
                  <tr><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.5px;">Time</td><td style="padding:10px 14px;font-size:13px;font-weight:700;color:#3b82f6;">${appt.timeSlot}</td></tr>
                  <tr style="background:#f8f9fb;"><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.5px;border-radius:0 0 0 8px;">Type</td><td style="padding:10px 14px;font-size:13px;color:#344054;">${appt.type === 'online' ? '🎥 Online' : '🏥 In-Person'}</td></tr>
                </table>
              </div>
              <div style="padding:16px 32px;background:#eff6ff;text-align:center;">
                <p style="font-size:12px;color:#1d4ed8;margin:0;">Please be on time. If you need to cancel, do so from your dashboard.</p>
              </div>
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
