const Product = require('../model/Product');

// Get all categories with product counts
const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category details with products
const getCategoryDetails = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const products = await Product.find({ 
      category: { $regex: category, $options: 'i' } 
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Product.countDocuments({ 
      category: { $regex: category, $options: 'i' } 
    });
    
    const categoryStats = await Product.aggregate([
      { $match: { category: { $regex: category, $options: 'i' } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    
    res.json({
      category,
      products,
      stats: categoryStats[0] || {},
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get popular categories
const getPopularCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviews' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryDetails,
  getPopularCategories
};