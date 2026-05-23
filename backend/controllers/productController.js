/**
 * Product Controller
 * Handles product CRUD, search, filtering, and smart suggestions
 */
const Product = require('../models/Product');

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, budgetFriendly, organic, page = 1, limit = 20 } = req.query;

    // Build query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (budgetFriendly === 'true') {
      query.isBudgetFriendly = true;
    }

    if (organic === 'true') {
      query.isOrganic = true;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('alternatives');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// @desc    Get product categories with counts
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const categoryEmojis = {
      Fruits: '🍎',
      Vegetables: '🥬',
      Dairy: '🥛',
      Snacks: '🍿',
      Beverages: '🥤',
      Grains: '🌾',
      Meat: '🥩',
      Bakery: '🍞',
      Frozen: '🧊',
      Household: '🏠',
    };

    const result = categories.map((cat) => ({
      name: cat._id,
      count: cat.count,
      emoji: categoryEmojis[cat._id] || '📦',
    }));

    res.status(200).json({
      success: true,
      categories: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// @desc    Get cheaper alternatives for a product
// @route   GET /api/products/:id/alternatives
// @access  Public
exports.getAlternatives = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find cheaper products in the same category
    const alternatives = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      price: { $lt: product.price },
    })
      .sort({ price: 1 })
      .limit(4);

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
      },
      alternatives,
      savings: alternatives.map((alt) => ({
        name: alt.name,
        price: alt.price,
        savedAmount: product.price - alt.price,
        savedPercentage: Math.round(((product.price - alt.price) / product.price) * 100),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alternatives',
      error: error.message,
    });
  }
};

// @desc    Get budget-friendly products
// @route   GET /api/products/budget-friendly
// @access  Public
exports.getBudgetFriendly = async (req, res) => {
  try {
    const products = await Product.find({ isBudgetFriendly: true })
      .sort({ price: 1 })
      .limit(12);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget-friendly products',
      error: error.message,
    });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

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

// @desc    Rate a product
// @route   POST /api/products/:id/rate
// @access  Private
exports.rateProduct = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Simple rating average calculation
    const currentTotal = product.ratings.average * product.ratings.count;
    product.ratings.count += 1;
    product.ratings.average = Number(((currentTotal + rating) / product.ratings.count).toFixed(1));

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted',
      ratings: product.ratings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to rate product',
      error: error.message,
    });
  }
};
