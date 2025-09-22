const Cart = require('../model/Cart');
const Product = require('../model/Product');

// Get cart by session ID
const getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let cart = await Cart.findOne({ sessionId }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { sessionId, productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.discount > 0 ? 
          product.price - (product.price * product.discount / 100) : 
          product.price
      });
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { sessionId, productId } = req.body;
    
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};