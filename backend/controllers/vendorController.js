/**
 * Vendor Controller
 * Handles vendor registration, dashboard stats, product/order management
 */
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Register as vendor
// @route   POST /api/vendors/register
// @access  Private
exports.registerVendor = async (req, res) => {
  try {
    const { storeName, storeDescription, category, address, phone, gstNumber } = req.body;

    // Check if already a vendor
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a vendor',
      });
    }

    // Create vendor profile
    const vendor = await Vendor.create({
      user: req.user.id,
      storeName,
      storeDescription,
      category,
      address,
      phone,
      gstNumber,
    });

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'vendor_approval',
        title: 'New Vendor Registration',
        message: `${storeName} has applied to become a vendor. Review and approve.`,
        link: '/admin/vendors',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vendor registration submitted for approval',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vendor registration failed',
      error: error.message,
    });
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private/Vendor
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile',
      error: error.message,
    });
  }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private/Vendor
exports.getDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Get products count
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });
    const activeProducts = await Product.countDocuments({ vendor: vendor._id, isActive: true });
    const outOfStock = await Product.countDocuments({ vendor: vendor._id, stock: 0 });

    // Get orders
    const orders = await Order.find({ vendor: vendor._id });
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // Monthly sales data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          vendor: vendor._id,
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { vendor: vendor._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStock,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        monthlySales,
        categoryDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message,
    });
  }
};

// @desc    Get vendor's products
// @route   GET /api/vendors/products
// @access  Private/Vendor
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// @desc    Add product (vendor)
// @route   POST /api/vendors/products
// @access  Private/Vendor
exports.addProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is not yet approved',
      });
    }

    const product = await Product.create({
      ...req.body,
      vendor: vendor._id,
    });

    // Update vendor product count
    vendor.totalProducts += 1;
    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message,
    });
  }
};

// @desc    Update product (vendor)
// @route   PUT /api/vendors/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not yours' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated',
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// @desc    Delete product (vendor)
// @route   DELETE /api/vendors/products/:id
// @access  Private/Vendor
exports.deleteProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not yours' });
    }

    await Product.findByIdAndDelete(req.params.id);
    vendor.totalProducts = Math.max(0, vendor.totalProducts - 1);
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

// @desc    Get vendor's orders
// @route   GET /api/vendors/orders
// @access  Private/Vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const orders = await Order.find({ vendor: vendor._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('items.product');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// @desc    Update order status (vendor)
// @route   PUT /api/vendors/orders/:id/status
// @access  Private/Vendor
exports.updateVendorOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const order = await Order.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'paid';
      // Update vendor revenue
      vendor.totalSales += 1;
      vendor.totalRevenue += order.totalPrice;
      await vendor.save();
    }

    await order.save();

    // Notify user about order status
    await Notification.create({
      user: order.user,
      type: 'order_update',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} is now ${status}`,
      link: `/dashboard`,
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
};
