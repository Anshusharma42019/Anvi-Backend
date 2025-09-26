const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Marble', 'Granite', 'Ceramic', 'Porcelain', 'Wooden']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: function() { return this.price; }
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  image: {
    type: String,
    required: false
  },
  imagePublicId: {
    type: String
  },
  images: [{
    url: String,
    publicId: String
  }],
  size: {
    type: String,
    required: true
  },
  thickness: {
    type: String,
    required: true
  },
  finish: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 4,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 100
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);