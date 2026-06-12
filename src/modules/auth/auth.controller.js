const { registerUser,loginUser,refreshAccessToken   } = require('./auth.service');

const register = async (req, res) => {
  try {
    const { name, middle_name, surname, email, password } = req.body;

    // Validation
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const user = await registerUser({ name, middle_name, surname, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const data = await loginUser({ email, password });

    res.status(200).json({
      message: 'Login successful',
      ...data,
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
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

    res.status(200).json({
      message: 'Access token refreshed successfully',
      ...data,
    });
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

module.exports = { register, login, refreshToken };
