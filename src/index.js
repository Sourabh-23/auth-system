const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');


dotenv.config();

const app = express();

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }

  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Helmet - Security headers
app.use(helmet());

// Rate Limiting - Global (har route pe)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Auth specific limiter - Login/Register pe strict
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // sirf 10 requests per 15 min
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
});

app.use(express.json());

// Test DB connection
db.raw('SELECT 1')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// Routes
app.use('/api/auth', authLimiter, authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Auth System is running 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
