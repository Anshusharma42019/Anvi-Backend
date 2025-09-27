const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://anvi-frontend-ne9l.vercel.app",
    "http://anvi-backend-theta.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anvi-showroom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
try {
  app.use('/api/products', require('./src/route/productRoutes'));
  app.use('/api/cart', require('./src/route/cartRoutes'));
  app.use('/api/orders', require('./src/route/orderRoutes'));
  app.use('/api/contact', require('./src/route/contactRoutes'));
  app.use('/api/categories', require('./src/route/categoryRoutes'));
  app.use('/api/search', require('./src/route/searchRoutes'));
  app.use('/api/admin', require('./src/route/adminRoutes'));
  app.use('/api/reviews', require('./src/route/reviewRoutes'));
  app.use('/api/catalogue', require('./src/route/catalogueRoutes'));
  app.use('/api/upload', require('./src/route/uploadRoutes'));
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Anvi Showroom API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Basic product redirect
app.get('/product', (req, res) => {
  res.redirect('/api/products');
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Anvi Showroom API Documentation',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /api/health': 'Health check',
      'GET /api/products': 'Get all products',
      'POST /api/products': 'Create product',
      'GET /api/cart': 'Get cart items',
      'POST /api/cart': 'Add to cart',
      'GET /api/orders': 'Get orders',
      'POST /api/orders': 'Create order',
      'POST /api/contact': 'Submit contact form',
      'GET /api/categories': 'Get categories',
      'GET /api/search': 'Search products',
      'GET /api/reviews': 'Get reviews',
      'GET /api/catalogue': 'Get catalogue'
    }
  });
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anvi Showroom API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Don't send generic error for upload routes
  if (req.url.includes('/upload')) {
    return res.status(500).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;