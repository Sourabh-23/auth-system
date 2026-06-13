const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendOTPEmail } = require('../../config/mailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async ({ name, middle_name, surname, email, password }) => {
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new Error('Email already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const [user] = await db('users')
    .insert({ name, middle_name, surname, email, password: hashedPassword })
    .returning(['id', 'name', 'email', 'status', 'created_at']);
  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const otpCode = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  await db('otp_tokens').where({ user_id: user.id }).delete();
  await db('otp_tokens').insert({ user_id: user.id, otp_code: otpCode, expires_at: expiresAt });
  await sendOTPEmail(user.email, otpCode);

  return { message: 'OTP sent to your email', userId: user.id };
};

const verifyOTP = async ({ userId, otpCode }) => {
  const otpRecord = await db('otp_tokens').where({ user_id: userId, otp_code: otpCode }).first();
  if (!otpRecord) throw new Error('Invalid OTP');
  if (otpRecord.is_used) throw new Error('OTP already used');
  if (new Date() > new Date(otpRecord.expires_at)) throw new Error('OTP expired');

  await db('otp_tokens').where({ id: otpRecord.id }).update({ is_used: true });

  const user = await db('users').where({ id: userId }).first();

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db('refresh_tokens').insert({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, status: user.status, role: user.role },
  };
};

const refreshAccessToken = async (refreshToken) => {
  const tokenRecord = await db('refresh_tokens').where({ token: refreshToken }).first();
  if (!tokenRecord) throw new Error('Invalid refresh token');
  if (tokenRecord.is_revoked) throw new Error('Refresh token has been revoked');
  if (new Date() > new Date(tokenRecord.expires_at)) throw new Error('Refresh token expired');

  const accessToken = jwt.sign({ id: tokenRecord.user_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return { accessToken };
};

const logoutUser = async (refreshToken) => {
  const updated = await db('refresh_tokens').where({ token: refreshToken }).update({ is_revoked: true });
  if (!updated) throw new Error('Invalid refresh token');
  return { message: 'Logged out successfully' };
};

const forgotPassword = async (email) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('User not found');

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  await db('password_reset_tokens').insert({ user_id: user.id, token: resetToken, expires_at: expiresAt });
  await sendPasswordResetEmail(email, resetToken);

  return { message: 'Password reset link sent to your email' };
};

const resetPassword = async (token, newPassword) => {
  const tokenRecord = await db('password_reset_tokens').where({ token }).first();
  if (!tokenRecord) throw new Error('Invalid reset token');
  if (tokenRecord.is_used) throw new Error('Reset token already used');
  if (new Date() > new Date(tokenRecord.expires_at)) throw new Error('Reset token expired');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db('users').where({ id: tokenRecord.user_id }).update({ password: hashedPassword });
  await db('password_reset_tokens').where({ token }).update({ is_used: true });

  return { message: 'Password reset successfully' };
};

module.exports = { registerUser, loginUser, verifyOTP, refreshAccessToken, logoutUser, forgotPassword, resetPassword };