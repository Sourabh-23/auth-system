const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, forgotPasswordHandler, resetPasswordHandler } = require('./auth.controller');
const { authenticate } = require('./auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

// Protected route
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Profile fetched successfully',
    user: req.user,
  });
});

module.exports = router;