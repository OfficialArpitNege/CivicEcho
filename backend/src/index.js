const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log authority email whitelist for debugging
const AUTHORITY_EMAIL_WHITELIST = process.env.AUTHORITY_EMAIL_WHITELIST
  ? process.env.AUTHORITY_EMAIL_WHITELIST.split(',').map((email) => email.trim().toLowerCase())
  : [];
console.log(`\n👤 Authority Email Whitelist: ${AUTHORITY_EMAIL_WHITELIST.length > 0 ? AUTHORITY_EMAIL_WHITELIST.join(', ') : 'NONE'}\n`);

// Import routes
const complaintRoutes = require('./routes/complaintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const authorityRoutes = require('./routes/authorityRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CivicEcho Backend is running' });
});

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/authority', authorityRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 CivicEcho Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
