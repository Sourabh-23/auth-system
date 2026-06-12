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

module.exports = { registerUser, loginUser, refreshAccessToken };

