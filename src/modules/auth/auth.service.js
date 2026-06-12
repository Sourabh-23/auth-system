const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const registerUser = async ({ name, middle_name, surname, email, password }) => {
  // Step 1: Check if email already exists
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Step 2: Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Step 3: Save user in DB
  const [user] = await db('users')
    .insert({
      name,
      middle_name,
      surname,
      email,
      password: hashedPassword,
    })
    .returning(['id', 'name', 'email', 'status', 'created_at']);

  return user;
};
const loginUser = async ({ email, password }) => {
  // Step 1: Email exist karta hai?
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Step 2: Password match karta hai?
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Step 3: Access Token banao (sirf id daalo)
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Step 4: Refresh Token banao
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Step 5: Refresh Token DB mein save karo
  await db('refresh_tokens').insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    },
  };
};

const refreshAccessToken = async (refreshToken) => {
  // Step 1: DB mein token exist karta hai?
  const tokenRecord = await db('refresh_tokens')
    .where({ token: refreshToken })
    .first();

  if (!tokenRecord) {
    throw new Error('Invalid refresh token');
  }

  // Step 2: Token revoked toh nahi?
  if (tokenRecord.is_revoked) {
    throw new Error('Refresh token has been revoked');
  }

  // Step 3: Token expire toh nahi hua?
  if (new Date() > new Date(tokenRecord.expires_at)) {
    throw new Error('Refresh token expired');
  }

  // Step 4: Naya Access Token banao
  const accessToken = jwt.sign(
    { id: tokenRecord.user_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { accessToken };
};

const logoutUser = async (refreshToken) => {
  // DB mein token revoke karo
  const updated = await db('refresh_tokens')
    .where({ token: refreshToken })
    .update({ is_revoked: true });

  if (!updated) {
    throw new Error('Invalid refresh token');
  }

  return { message: 'Logged out successfully' };
};



const forgotPassword = async (email) => {
  // Step 1: Email exist karta hai?
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new Error('User not found');
  }

  // Step 2: Random reset token banao
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Step 3: 15 min expiry
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  // Step 4: DB mein save karo
  await db('password_reset_tokens').insert({
    user_id: user.id,
    token: resetToken,
    expires_at: expiresAt,
  });

  // Step 5: Email bhejo (abhi console pe print karenge)
  console.log(`Reset link: http://localhost:3000/api/auth/reset-password?token=${resetToken}`);

  return { message: 'Password reset link sent to your email' };
};

const resetPassword = async (token, newPassword) => {
  // Step 1: Token DB mein exist karta hai?
  const tokenRecord = await db('password_reset_tokens')
    .where({ token })
    .first();

  if (!tokenRecord) {
    throw new Error('Invalid reset token');
  }

  // Step 2: Token already use hua?
  if (tokenRecord.is_used) {
    throw new Error('Reset token already used');
  }

  // Step 3: Token expire hua?
  if (new Date() > new Date(tokenRecord.expires_at)) {
    throw new Error('Reset token expired');
  }

  // Step 4: Naya password hash karo
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Step 5: Password update karo
  await db('users')
    .where({ id: tokenRecord.user_id })
    .update({ password: hashedPassword });

  // Step 6: Token is_used = true karo
  await db('password_reset_tokens')
    .where({ token })
    .update({ is_used: true });

  return { message: 'Password reset successfully' };
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, forgotPassword, resetPassword };



