const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} = require('../controller/orderController');

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/orders/stats - Get order statistics (admin)
router.get('/stats', getOrderStats);

// GET /api/orders - Get all orders (admin)
router.get('/', getAllOrders);

// GET /api/orders/number/:orderNumber - Get order by order number
router.get('/number/:orderNumber', getOrderByNumber);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

module.exports = router;