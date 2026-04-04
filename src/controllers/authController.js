const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
  'yopmail.com', 'trashmail.com', 'maildrop.cc', 'dispostable.com',
  'fakeinbox.com', 'spamgourmet.com', 'mytemp.email', 'temp-mail.org',
  'tempinbox.com', 'discard.email', 'mailnull.com', 'spamcowboy.com',
  'getairmail.com', 'filzmail.com', 'throwam.com', 'tempr.email',
  'dispostable.com', 'mailnesia.com', 'mailnull.com', 'spamgourmet.com',
  'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.net',
  'tempmail.ninja', 'tempmail.plus', 'emailondeck.com', 'mohmal.com',
  'getnada.com', 'mailtemp.info', 'spambox.us', '10minutemail.com',
  'minutemail.com', 'tempinbox.com', 'throwaway.email', 'mailsac.com',
];

const isBlockedEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
};

const register = async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'Name, email, password and role are required' });

  if (role === 'doctor' && !specialization)
    return res.status(400).json({ message: 'Specialization is required for doctors' });

  if (isBlockedEmail(email))
    return res.status(400).json({ message: 'Temporary or disposable email addresses are not allowed' });
  try {
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, specialization });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'doctor')
      await User.findByIdAndUpdate(user._id, { isAvailable: true });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user.role === 'doctor')
      await User.findByIdAndUpdate(req.user._id, { isAvailable: false });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"SmartDoc" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'SmartDoc — Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                      color: #3b82f6; padding: 20px; background: #eff6ff;
                      border-radius: 8px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Email, OTP and new password are required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.resetOtpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP has expired. Request a new one.' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, logout, forgotPassword, resetPassword };
