/**
 * Server Entry Point
 *
 * Bootstraps the Express application:
 * 1. Loads environment variables
 * 2. Configures middleware (CORS, JSON parsing)
 * 3. Mounts all API route groups
 * 4. Connects to MongoDB
 * 5. Starts listening on the configured port
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───

// Enable CORS for the frontend dev server
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost origin (e.g. 5173, 5174, 3000)
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parse JSON bodies (large limit for base64-encoded food images)
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── API Routes ───

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/report', reportRoutes);

// ─── Health Check ───
// Simple endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NutriTrack API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ───
// Catch requests to undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───
// Catches unhandled errors from async route handlers
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ───
// Connect to MongoDB first, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 NutriTrack server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
  });
});
