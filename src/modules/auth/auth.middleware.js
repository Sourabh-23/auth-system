const jwt = require('jsonwebtoken');
const db = require('../../config/db');

const authenticate = async (req, res, next) => {
  try {
    // Step 1: Token header mein hai?
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Step 2: Token nikalo
    const token = authHeader.split(' ')[1];

    // Step 3: Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: User DB mein exist karta hai?
    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Step 5: User ko request mein daalo
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { authenticate };