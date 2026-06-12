const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');

dotenv.config();

const app = express();

app.use(express.json());

// Test DB connection
db.raw('SELECT 1')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Auth System is running 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});