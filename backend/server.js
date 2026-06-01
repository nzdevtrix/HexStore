// ====================================
// HEXSTORE BACKEND - MAIN SERVER
// Express.js + Firebase Admin SDK
// ====================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import Firebase config
const { initializeFirebase } = require('./config/firebase');

// Import routes
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const analyticsRouter = require('./routes/analytics');
const systemRouter = require('./routes/system');

// Import middleware
const { verifyFirebaseToken, requireAdmin, requireApiKey } = require('./middleware/auth');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ====================================
// MIDDLEWARE
// ====================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// ====================================
// ROUTES
// ====================================

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HexStore Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Protected routes (Firebase token required)
app.use('/api/users', verifyFirebaseToken, requireAdmin, usersRouter);
app.use('/api/products', verifyFirebaseToken, requireAdmin, productsRouter);
app.use('/api/orders', verifyFirebaseToken, requireAdmin, ordersRouter);
app.use('/api/analytics', verifyFirebaseToken, requireAdmin, analyticsRouter);

// System routes (Firebase token + admin required)
app.use('/api/system', verifyFirebaseToken, requireAdmin, systemRouter);

// ====================================
// SERVE STATIC FILES (Angular Dashboard)
// ====================================

// Serve the Angular dashboard build
const dashboardPath = path.join(__dirname, '..', 'dashboard-app', 'dist', 'hexstore-dashboard');
app.use('/dashboard-app', express.static(dashboardPath));

// SPA fallback for dashboard routes
app.get('/dashboard-app/{*splat}', (req, res) => {
  res.sendFile(path.join(dashboardPath, 'index.html'));
});

// Serve project root static files (access, public, etc.)
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot));

// ====================================
// ERROR HANDLING
// ====================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: 'GET /api/health',
      users: 'GET/POST/PUT/PATCH/DELETE /api/users',
      products: 'GET/POST/PUT/PATCH/DELETE /api/products',
      orders: 'GET/POST/PUT/PATCH/DELETE /api/orders',
      analytics: 'GET /api/analytics/overview, /api/analytics/revenue, /api/analytics/users',
      system: 'GET /api/system/health, /api/system/collections, /api/system/project, /api/system/processes'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ====================================
// START SERVER
// ====================================

async function startServer() {
  try {
    // Initialize Firebase
    console.log('\n🔥 Initializing Firebase Admin SDK...');
    initializeFirebase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 HexStore Backend API running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard-app/`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`\n📋 Available API Endpoints:`);
      console.log(`   GET    /api/health`);
      console.log(`   GET    /api/users`);
      console.log(`   GET    /api/users/:id`);
      console.log(`   PUT    /api/users/:id`);
      console.log(`   PATCH  /api/users/:id/role`);
      console.log(`   DELETE /api/users/:id`);
      console.log(`   GET    /api/products`);
      console.log(`   POST   /api/products`);
      console.log(`   PUT    /api/products/:id`);
      console.log(`   DELETE /api/products/:id`);
      console.log(`   GET    /api/orders`);
      console.log(`   POST   /api/orders`);
      console.log(`   PATCH  /api/orders/:id/status`);
      console.log(`   GET    /api/analytics/overview`);
      console.log(`   GET    /api/analytics/revenue`);
      console.log(`   GET    /api/analytics/users`);
      console.log(`   GET    /api/system/health`);
      console.log(`   GET    /api/system/collections`);
      console.log(`   GET    /api/system/project`);
      console.log(`   POST   /api/system/seed`);
      console.log(`\n🔑 Authentication: Firebase ID Token (Bearer) required for protected routes`);
      console.log(`   Admin access only for /api/users, /api/products, /api/orders, /api/analytics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;