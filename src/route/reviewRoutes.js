const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  markHelpful,
  getAllReviews,
  updateReviewStatus
} = require('../controller/reviewController');

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', getProductReviews);

// POST /api/reviews - Create new review
router.post('/', createReview);

// PUT /api/reviews/:id/helpful - Mark review as helpful
router.put('/:id/helpful', markHelpful);

// GET /api/reviews/admin - Get all reviews (admin)
router.get('/admin', getAllReviews);

// PUT /api/reviews/:id/status - Update review status (admin)
router.put('/:id/status', updateReviewStatus);

module.exports = router;