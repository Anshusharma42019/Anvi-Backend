const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary configured for uploads');

// Configure multer for local storage as fallback
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = 'uploads';
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory');
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Upload single image
const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    console.log('Uploading to Cloudinary...');
    const result = await Promise.race([
      cloudinary.uploader.upload(req.file.path, {
        folder: 'anvi-tiles',
        resource_type: 'auto',
        timeout: 25000
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cloudinary upload timeout')), 25000)
      )
    ]);

    console.log('Cloudinary upload successful:', result.public_id);

    // Delete local file
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('Local file cleaned up');
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      file: req.file ? req.file.filename : 'No file'
    });
    
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Upload timeout - please try again';
    } else if (error.message.includes('File too large')) {
      statusCode = 413;
      errorMessage = 'File too large - maximum size is 10MB';
    } else if (error.message.includes('Invalid file type')) {
      statusCode = 400;
      errorMessage = 'Invalid file type - only images are allowed';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => 
      cloudinary.uploader.upload(file.path, {
        folder: 'anvi-tiles',
        resource_type: 'auto'
      })
    );

    const results = await Promise.all(uploadPromises);
    
    // Delete local files
    const fs = require('fs');
    req.files.forEach(file => fs.unlinkSync(file.path));

    const images = results.map(result => ({
      imageUrl: result.secure_url,
      publicId: result.public_id
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: images
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up local files if they exist
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage
};