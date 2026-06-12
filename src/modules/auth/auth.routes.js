const express = require('express');
const router = express.Router();
const { register, login, refreshToken } = require('./auth.controller');
const { authenticate } = require('./auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected route
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Profile fetched successfully',
    user: req.user,
  });
});

module.exports = router;