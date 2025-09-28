const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMultipleImages, deleteImage, uploadFile } = require('../controller/uploadController');
// Note: UserController uses ES6 modules, but this file uses CommonJS
// We'll handle file upload directly in this route file for now
const multer = require('multer');

const fileUpload = multer({ dest: 'uploads/' }); // Temporary storage for uploads

// Handle preflight OPTIONS requests
router.options('*', (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://anvi-frontend.vercel.app',
    'https://anvi-full.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(200);
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Upload endpoint working',
    routes: {
      'POST /': 'Upload single image',
      'POST /file': 'Upload single file',
      'POST /multiple': 'Upload multiple images',
      'DELETE /:publicId': 'Delete image'
    }
  });
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
router.post('/', upload.single('image'), uploadImage);

// POST /api/upload/multiple - Upload multiple images
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

// POST /api/upload/file - Upload single file (images, PDFs, docs)
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'anvi-tiles/products',
      resource_type: 'auto',
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// DELETE /api/upload/:publicId - Delete image
router.delete('/:publicId', deleteImage);

// File upload endpoint (alternative to main upload)
router.post("/upload-file", fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_profiles',
      resource_type: 'image',
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      message: 'File uploaded successfully to Cloudinary'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// Debug route (must be last)
router.all('*', (req, res) => {
  res.status(404).json({ 
    error: 'Upload route not found',
    method: req.method,
    path: req.path,
    available: ['/test', '/', '/file', '/multiple', '/test-cloudinary']
  });
});

module.exports = router;