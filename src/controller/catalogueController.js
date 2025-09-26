const Product = require('../model/Product');
const Catalogue = require('../model/Catalogue');

// Get catalogue with categories and featured products
const getCatalogue = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          sampleImage: { $first: '$image' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get catalogue images from database
    const catalogues = await Catalogue.find();
    const catalogueImages = {};
    catalogues.forEach(cat => {
      catalogueImages[cat.category] = cat.imageUrl;
    });
    
    // Add catalogue images to categories
    const categoriesWithImages = categories.map(cat => ({
      ...cat,
      catalogueImage: catalogueImages[cat._id] || cat.sampleImage
    }));

    const featuredProducts = await Product.find({ rating: { $gte: 4.5 } })
      .limit(6)
      .sort({ rating: -1, reviews: -1 });

    res.json({
      categories: categoriesWithImages,
      featuredProducts,
      totalCategories: categories.length,
      totalProducts: await Product.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get catalogue images
const getCatalogueImages = async (req, res) => {
  try {
    const catalogues = await Catalogue.find();
    const catalogueData = {};
    catalogues.forEach(cat => {
      catalogueData[cat.category] = {
        imageUrl: cat.imageUrl,
        catalogueNumber: cat.catalogueNumber,
        description: cat.description
      };
    });
    res.json(catalogueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new catalogue category
const createCatalogueCategory = async (req, res) => {
  try {
    console.log('Creating catalogue category with data:', req.body);
    
    const { category, catalogueNumber, imageUrl, imagePublicId, description } = req.body;
    
    if (!category || !catalogueNumber || !imageUrl) {
      console.log('Missing required fields:', { category, catalogueNumber, imageUrl });
      return res.status(400).json({ error: 'Category, catalogue number, and image URL are required' });
    }
    
    const catalogue = new Catalogue({ 
      category, 
      catalogueNumber, 
      imageUrl, 
      imagePublicId,
      description 
    });
    
    console.log('Saving catalogue:', catalogue);
    await catalogue.save();
    
    console.log('Catalogue saved successfully');
    res.status(201).json({ 
      message: 'Catalogue category created successfully',
      catalogue
    });
  } catch (error) {
    console.error('Error creating catalogue category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category or catalogue number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update catalogue image
const updateCatalogueImage = async (req, res) => {
  try {
    const { category } = req.params;
    const { catalogueNumber, imageUrl, imagePublicId, description } = req.body;
    
    const updateData = {};
    if (catalogueNumber) updateData.catalogueNumber = catalogueNumber;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (imagePublicId) updateData.imagePublicId = imagePublicId;
    if (description !== undefined) updateData.description = description;
    
    const catalogue = await Catalogue.findOneAndUpdate(
      { category },
      updateData,
      { new: true }
    );
    
    if (!catalogue) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ 
      message: 'Catalogue updated successfully',
      catalogue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete catalogue category
const deleteCatalogueCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const catalogue = await Catalogue.findOneAndDelete({ category });
    
    if (!catalogue) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ 
      message: 'Catalogue category deleted successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category showcase
const getCategoryShowcase = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ 
      category: { $regex: category, $options: 'i' } 
    }).limit(8);

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
      stats: categoryStats[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCatalogue,
  getCategoryShowcase,
  getCatalogueImages,
  createCatalogueCategory,
  updateCatalogueImage,
  deleteCatalogueCategory
};