const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

console.log('🔍 Diagnosing Upload System...\n');

// 1. Check environment variables
console.log('1. Environment Variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log();

// 2. Test Cloudinary configuration
console.log('2. Testing Cloudinary Configuration:');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.ping()
  .then(result => {
    console.log('   ✅ Cloudinary connection successful');
    console.log('   Rate limit remaining:', result.rate_limit_remaining);
  })
  .catch(error => {
    console.log('   ❌ Cloudinary connection failed:', error.message);
  });

// 3. Check uploads directory
console.log('\n3. Checking uploads directory:');
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('   ✅ Created uploads directory');
} else {
  console.log('   ✅ Uploads directory exists');
}

// 4. Test multer configuration
console.log('\n4. Testing Multer Configuration:');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

console.log('   ✅ Multer configured successfully');

// 5. Check route files
console.log('\n5. Checking route files:');
const routeFiles = [
  './src/route/uploadRoutes.js',
  './src/controller/uploadController.js',
  './src/utils/cloudinary.js'
];

routeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n🎯 Diagnosis complete!');
console.log('\nNext steps:');
console.log('1. Make sure your server is running');
console.log('2. Test upload via frontend or Postman');
console.log('3. Check server logs for detailed error messages');