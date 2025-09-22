const Review = require('../model/Review');
const Product = require('../model/Product');

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const reviews = await Review.find({ 
      product: productId, 
      status: 'approved' 
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ 
      product: productId, 
      status: 'approved' 
    });
    
    const ratingStats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      reviews,
      ratingStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new review
const createReview = async (req, res) => {
  try {
    const { productId, customer, rating, title, comment } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const review = new Review({
      product: productId,
      customer,
      rating,
      title,
      comment
    });
    
    await review.save();
    
    // Update product rating
    await updateProductRating(productId);
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update product rating based on reviews
const updateProductRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find(query)
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments(query);
    
    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update review status
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('product', 'name');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Update product rating if review was approved/rejected
    if (status === 'approved' || status === 'rejected') {
      await updateProductRating(review.product._id);
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  markHelpful,
  getAllReviews,
  updateReviewStatus
};