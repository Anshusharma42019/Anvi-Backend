const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportData
} = require('../controller/adminController');

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// PUT /api/admin/products/bulk-update - Bulk update products
router.put('/products/bulk-update', bulkUpdateProducts);

// DELETE /api/admin/products/bulk-delete - Bulk delete products
router.delete('/products/bulk-delete', bulkDeleteProducts);

// GET /api/admin/export - Export data
router.get('/export', exportData);

module.exports = router;