const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/productController');

// GET /api/products - Get all products with filtering
router.get('/', getProducts);

// GET /api/products/featured - Get featured products
router.get('/featured', getFeaturedProducts);

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', getProductsByCategory);

// GET /api/products/:id/recommendations - Get product recommendations
router.get('/:id/recommendations', getRecommendations);

// GET /api/products/:id - Get single product
router.get('/:id', getProductById);

// POST /api/products - Create new product (admin)
router.post('/', createProduct);

// PUT /api/products/:id - Update product (admin)
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product (admin)
router.delete('/:id', deleteProduct);

module.exports = router;