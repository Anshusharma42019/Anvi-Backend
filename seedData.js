const mongoose = require('mongoose');
const Product = require('./src/model/Product');
const Catalogue = require('./src/model/Catalogue');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Premium Marble White",
    description: "Elegant white marble tiles with natural veining patterns. Perfect for luxury interiors and high-end residential projects.",
    category: "Marble",
    price: 120,
    image: "https://images.unsplash.com/photo-1596079890748-5b0f45a0fbe6",
    images: [
      "https://images.unsplash.com/photo-1596079890748-5b0f45a0fbe6",
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0"
    ],
    size: "60x60 cm",
    thickness: "10mm",
    finish: "Polished",
    features: ["Scratch Resistant", "Stain Proof", "Easy Maintenance", "Natural Stone Look"],
    rating: 4.8,
    reviews: 45,
    tags: ["luxury", "marble", "white", "premium"]
  },
  {
    name: "Black Granite Polished",
    description: "Premium black granite tiles with mirror-like finish. Ideal for modern kitchens and commercial spaces.",
    category: "Granite",
    price: 95,
    image: "https://images.unsplash.com/photo-1616627455412-1b8f8a2dced3",
    size: "60x60 cm",
    thickness: "12mm",
    finish: "High Gloss",
    features: ["Heat Resistant", "Durable", "Non-Slip", "Acid Resistant"],
    rating: 4.6,
    reviews: 32
  },
  {
    name: "Oak Wood Finish",
    description: "Realistic oak wood pattern tiles that bring warmth and natural beauty to any space without the maintenance of real wood.",
    category: "Wooden",
    price: 85,
    image: "https://images.unsplash.com/photo-1556910103-1b3f5af5b8f9",
    size: "20x120 cm",
    thickness: "8mm",
    finish: "Textured",
    features: ["Water Resistant", "Termite Proof", "Fade Resistant", "Realistic Texture"],
    rating: 4.4,
    reviews: 28
  },
  {
    name: "Matte Ceramic Grey",
    description: "Contemporary grey ceramic tiles with matte finish. Perfect for modern minimalist designs and urban interiors.",
    category: "Ceramic",
    price: 65,
    image: "https://images.unsplash.com/photo-1626784372680-55ce49963cf0",
    size: "30x30 cm",
    thickness: "9mm",
    finish: "Matte",
    features: ["Anti-Bacterial", "Easy Clean", "Color Fast", "Eco-Friendly"],
    rating: 4.2,
    reviews: 56
  },
  {
    name: "Glossy Ceramic Blue",
    description: "Vibrant blue ceramic tiles with glossy finish for bathrooms and kitchens.",
    category: "Ceramic",
    price: 70,
    discount: 10,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
    size: "30x60 cm",
    thickness: "9mm",
    finish: "Glossy",
    features: ["Water Resistant", "Easy Clean", "Vibrant Color", "Durable"],
    rating: 4.3,
    reviews: 23
  },
  {
    name: "Carrara Marble Veined",
    description: "Classic Carrara marble with distinctive veining, perfect for elegant bathrooms and kitchens.",
    category: "Marble",
    price: 150,
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0",
    size: "60x120 cm",
    thickness: "12mm",
    finish: "Polished",
    features: ["Natural Veining", "Luxury Appeal", "Heat Resistant", "Timeless Design"],
    rating: 4.9,
    reviews: 67
  },
  {
    name: "Rustic Wooden Plank",
    description: "Rustic wooden plank tiles with authentic texture and grain patterns.",
    category: "Wooden",
    price: 75,
    discount: 15,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    size: "15x90 cm",
    thickness: "8mm",
    finish: "Textured",
    features: ["Authentic Look", "Slip Resistant", "Easy Installation", "Maintenance Free"],
    rating: 4.1,
    reviews: 19
  },
  {
    name: "Porcelain Stone Effect",
    description: "High-quality porcelain tiles with natural stone effect, combining beauty with durability.",
    category: "Porcelain",
    price: 110,
    image: "https://images.unsplash.com/photo-1615875221405-8a1e5d3e8c8e",
    size: "60x60 cm",
    thickness: "10mm",
    finish: "Matt",
    features: ["Stone Effect", "Frost Resistant", "Low Maintenance", "High Durability"],
    rating: 4.5,
    reviews: 41
  },
  {
    name: "White Ceramic Subway",
    description: "Classic white subway tiles perfect for kitchen backsplashes and bathroom walls.",
    category: "Ceramic",
    price: 55,
    image: "https://images.unsplash.com/photo-1596079890748-5b0f45a0fbe6",
    size: "10x30 cm",
    thickness: "8mm",
    finish: "Glossy",
    features: ["Classic Design", "Easy Clean", "Versatile", "Affordable"],
    rating: 4.0,
    reviews: 89
  },
  {
    name: "Beige Ceramic Textured",
    description: "Textured beige ceramic tiles that add depth and character to any space.",
    category: "Ceramic",
    price: 60,
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0",
    size: "30x30 cm",
    thickness: "9mm",
    finish: "Textured",
    features: ["Textured Surface", "Neutral Color", "Non-Slip", "Modern Design"],
    rating: 4.2,
    reviews: 34
  }
];

const catalogueData = [
  { category: 'Marble', catalogueNumber: 'CAT-001', imageUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0', description: 'Premium marble collection with natural elegance' },
  { category: 'Granite', catalogueNumber: 'CAT-002', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', description: 'Durable granite tiles for modern spaces' },
  { category: 'Ceramic', catalogueNumber: 'CAT-003', imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e', description: 'Versatile ceramic tiles in various designs' },
  { category: 'Wooden', catalogueNumber: 'CAT-004', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', description: 'Wood-look tiles with authentic texture' },
  { category: 'Porcelain', catalogueNumber: 'CAT-005', imageUrl: 'https://images.unsplash.com/photo-1615875221405-8a1e5d3e8c8e', description: 'High-quality porcelain for luxury interiors' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anvi-showroom');
    
    // Clear existing data
    await Product.deleteMany({});
    await Catalogue.deleteMany({});
    
    // Insert sample data
    await Product.insertMany(sampleProducts);
    await Catalogue.insertMany(catalogueData);
    
    console.log('Database seeded successfully!');
    console.log(`Inserted ${sampleProducts.length} products and ${catalogueData.length} catalogue categories`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();