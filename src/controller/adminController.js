const Product = require('../model/Product');
const Order = require('../model/Order');
const Contact = require('../model/Contact');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]);
    
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalContacts,
        newContacts,
        totalRevenue: revenueData[0]?.total || 0
      },
      monthlyOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk product operations
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updates }
    );
    
    res.json({
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk delete products
const bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    const result = await Product.deleteMany({ _id: { $in: productIds } });
    
    res.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export data
const exportData = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    
    let data;
    switch (type) {
      case 'products':
        data = await Product.find({});
        break;
      case 'orders':
        data = await Order.find({}).populate('items.product');
        break;
      case 'contacts':
        data = await Contact.find({});
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(item => {
    const obj = item.toObject ? item.toObject() : item;
    return headers.map(header => {
      const value = obj[header];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

module.exports = {
  getDashboardStats,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportData
};