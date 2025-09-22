const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anvi Showroom API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});