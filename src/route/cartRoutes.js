const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controller/cartController');

// GET /api/cart/:sessionId - Get cart by session ID
router.get('/:sessionId', getCart);

// POST /api/cart/add - Add item to cart
router.post('/add', addToCart);

// PUT /api/cart/update - Update cart item quantity
router.put('/update', updateCartItem);

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove', removeFromCart);

// DELETE /api/cart/:sessionId/clear - Clear entire cart
router.delete('/:sessionId/clear', clearCart);

module.exports = router;