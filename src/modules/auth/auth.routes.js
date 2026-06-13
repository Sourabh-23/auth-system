const express = require('express');
const router = express.Router();
const { register, login, verifyOTPHandler, refreshToken, logout, forgotPasswordHandler, resetPasswordHandler } = require('./auth.controller');
const { authenticate, authorize } = require('./auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTPHandler);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

// Protected routes
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'Profile fetched successfully', user: req.user });
});

router.get('/admin', authenticate, authorize('admin', 'superadmin'), (req, res) => {
  res.json({ message: 'Welcome Admin! 🔥' });
});

router.get('/superadmin', authenticate, authorize('superadmin'), (req, res) => {
  res.json({ message: 'Welcome Superadmin! 👑' });
});

module.exports = router;