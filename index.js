const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route - مهم لـ Vercel health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video API Server is running on Vercel',
    status: 'OK',
    endpoints: {
      collections: '/api/videos/collections',
      lastCollection: '/api/videos/last-collection',
      lastVideo: '/api/videos/last-video',
      allVideos: '/api/videos/all-videos'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// تأجيل الاتصال بقاعدة البيانات حتى أول طلب
let dbConnected = false;
const connectDBOnce = async () => {
  if (!dbConnected) {
    try {
      const connectDB = require('./config/db');
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
};

// Middleware للاتصال بقاعدة البيانات
app.use('/api/videos', async (req, res, next) => {
  try {
    await connectDBOnce();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// Routes
const videoRoutes = require('./routes/videoRoutes');
app.use('/api/videos', videoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export for Vercel
module.exports = app;

// للتطوير المحلي فقط
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}