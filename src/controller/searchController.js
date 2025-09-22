const Product = require('../model/Product');

// Advanced search with filters
const searchProducts = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      minPrice, 
      maxPrice, 
      size, 
      finish, 
      rating,
      page = 1, 
      limit = 12, 
      sortBy = 'relevance',
      sortOrder = 'desc' 
    } = req.query;
    
    let query = {};
    
    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { features: { $in: [new RegExp(q, 'i')] } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Size filter
    if (size && size !== 'All') {
      query.size = { $regex: size, $options: 'i' };
    }
    
    // Finish filter
    if (finish && finish !== 'All') {
      query.finish = { $regex: finish, $options: 'i' };
    }
    
    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    // Only show in-stock products
    query.inStock = true;
    
    const skip = (page - 1) * limit;
    
    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1, reviews: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { rating: -1, reviews: -1 };
    }
    
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    // Get search suggestions
    const suggestions = await getSearchSuggestions(q);
    
    res.json({
      products,
      suggestions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        categories: await getAvailableCategories(query),
        priceRange: await getPriceRange(query),
        sizes: await getAvailableSizes(query),
        finishes: await getAvailableFinishes(query)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get search suggestions
const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: '$name' },
          categories: { $addToSet: '$category' },
          tags: { $addToSet: '$tags' }
        }
      }
    ]);
    
    if (!suggestions.length) return [];
    
    const { names, categories, tags } = suggestions[0];
    const allSuggestions = [...names, ...categories, ...tags.flat()];
    
    return allSuggestions
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  } catch (error) {
    return [];
  }
};

// Get available categories for current search
const getAvailableCategories = async (baseQuery) => {
  const categories = await Product.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return categories;
};

// Get price range for current search
const getPriceRange = async (baseQuery) => {
  const priceStats = await Product.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
  return priceStats[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 100 };
};

// Get available sizes for current search
const getAvailableSizes = async (baseQuery) => {
  const sizes = await Product.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$size', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return sizes;
};

// Get available finishes for current search
const getAvailableFinishes = async (baseQuery) => {
  const finishes = await Product.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$finish', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return finishes;
};

// Get popular search terms
const getPopularSearches = async (req, res) => {
  try {
    const popularTerms = [
      'marble tiles',
      'bathroom tiles',
      'kitchen tiles',
      'wooden finish',
      'large format',
      'matte finish',
      'granite',
      'ceramic'
    ];
    
    res.json(popularTerms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-complete search
const autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          image: 1,
          price: 1
        }
      },
      { $limit: 8 }
    ]);
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  searchProducts,
  getPopularSearches,
  autocomplete
};