const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryDetails,
  getPopularCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controller/categoryController');

// GET /api/categories - Get all categories
router.get('/', getCategories);

// GET /api/categories/all - Get all categories for admin dropdown
router.get('/all', getAllCategories);

// GET /api/categories/popular - Get popular categories
router.get('/popular', getPopularCategories);

// POST /api/categories - Create category (Admin)
router.post('/', createCategory);

// PUT /api/categories/:id - Update category (Admin)
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete category (Admin)
router.delete('/:id', deleteCategory);

// GET /api/categories/:category - Get category details with products
router.get('/:category', getCategoryDetails);

module.exports = router;