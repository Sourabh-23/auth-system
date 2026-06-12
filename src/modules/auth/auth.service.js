const db = require('../../config/db');
const bcrypt = require('bcryptjs');

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





const jwt = require('jsonwebtoken');

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

  // Step 3: JWT token banao
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    },
  };
};

module.exports = { registerUser, loginUser };

