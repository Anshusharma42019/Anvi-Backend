const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryDetails,
  getPopularCategories
} = require('../controller/categoryController');

// GET /api/categories - Get all categories
router.get('/', getCategories);

// GET /api/categories/popular - Get popular categories
router.get('/popular', getPopularCategories);

// GET /api/categories/:category - Get category details with products
router.get('/:category', getCategoryDetails);

module.exports = router;