const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMultipleImages, deleteImage } = require('../controller/uploadController');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Upload endpoint working' });
});

// Test Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    
    // Configure for test
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config(process.env.CLOUDINARY_URL);
    }
    
    const result = await cloudinary.api.ping();
    res.json({ 
      message: 'Cloudinary connection successful',
      config: {
        url: process.env.CLOUDINARY_URL ? 'Connected' : 'Missing',
        cloud_name: 'Connected',
        api_key: 'Connected'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Cloudinary connection failed',
      message: error.message 
    });
  }
});

// POST /api/upload - Upload single image
router.post('/', (req, res, next) => {
  console.log('Upload route hit');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadImage);

// POST /api/upload/multiple - Upload multiple images
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

// DELETE /api/upload/:publicId - Delete image
router.delete('/:publicId', deleteImage);

module.exports = router;