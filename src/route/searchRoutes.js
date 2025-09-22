const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getPopularSearches,
  autocomplete
} = require('../controller/searchController');

// GET /api/search - Advanced product search
router.get('/', searchProducts);

// GET /api/search/popular - Get popular search terms
router.get('/popular', getPopularSearches);

// GET /api/search/autocomplete - Auto-complete suggestions
router.get('/autocomplete', autocomplete);

module.exports = router;