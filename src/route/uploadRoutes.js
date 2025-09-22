const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controller/uploadController');

// POST /api/upload - Upload single image
router.post('/', upload.single('image'), uploadImage);

module.exports = router;