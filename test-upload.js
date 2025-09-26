const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });

    // Test connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);

    // Test upload with a sample image URL
    const uploadResult = await cloudinary.uploader.upload(
      'https://via.placeholder.com/300x300.png',
      {
        folder: 'anvi-tiles',
        public_id: 'test-upload-' + Date.now()
      }
    );
    
    console.log('✅ Test upload successful:', {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

    // Clean up test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Test cleanup successful');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCloudinary();