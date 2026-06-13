const { registerUser, loginUser, verifyOTP, refreshAccessToken, logoutUser, forgotPassword, resetPassword } = require('./auth.service');

const register = async (req, res) => {
  try {
    const { name, middle_name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    const user = await registerUser({ name, middle_name, surname, email, password });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const data = await loginUser({ email, password });
    res.status(200).json(data);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    if (!userId || !otpCode) {
      return res.status(400).json({ message: 'userId and otpCode are required' });
    }
    const data = await verifyOTP({ userId, otpCode });
    res.status(200).json({ message: 'OTP verified successfully', ...data });
  } catch (error) {
    if (
      error.message === 'Invalid OTP' ||
      error.message === 'OTP already used' ||
      error.message === 'OTP expired'
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const data = await refreshAccessToken(refreshToken);
    res.status(200).json({ message: 'Access token refreshed successfully', ...data });
  } catch (error) {
    if (
      error.message === 'Invalid refresh token' ||
      error.message === 'Refresh token has been revoked' ||
      error.message === 'Refresh token expired'
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const data = await logoutUser(refreshToken);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === 'Invalid refresh token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const data = await forgotPassword(email);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const data = await resetPassword(token, newPassword);
    res.status(200).json(data);
  } catch (error) {
    if (
      error.message === 'Invalid reset token' ||
      error.message === 'Reset token already used' ||
      error.message === 'Reset token expired'
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, verifyOTPHandler, refreshToken, logout, forgotPasswordHandler, resetPasswordHandler };