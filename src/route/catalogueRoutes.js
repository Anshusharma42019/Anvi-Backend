const express = require('express');
const router = express.Router();
const {
  getCatalogue,
  getCategoryShowcase,
  getCatalogueImages,
  createCatalogueCategory,
  updateCatalogueImage,
  deleteCatalogueCategory
} = require('../controller/catalogueController');

// GET /api/catalogue - Get catalogue overview
router.get('/', getCatalogue);

// GET /api/catalogue/images - Get catalogue images
router.get('/images', getCatalogueImages);

// POST /api/catalogue/images - Create catalogue category
router.post('/images', createCatalogueCategory);

// PUT /api/catalogue/images/:category - Update catalogue image
router.put('/images/:category', updateCatalogueImage);

// DELETE /api/catalogue/images/:category - Delete catalogue category
router.delete('/images/:category', deleteCatalogueCategory);

// GET /api/catalogue/:category - Get category showcase
router.get('/:category', getCategoryShowcase);

module.exports = router;