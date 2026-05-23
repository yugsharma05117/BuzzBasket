/**
 * Auth Controller
 * Handles user registration, login, profile management
 */
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Only allow user/vendor registration (admin created manually)
    const userRole = role === 'vendor' ? 'vendor' : 'user';

    // Create user
    const user = await User.create({ name, email, password, phone, role: userRole });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        totalSpent: user.totalSpent,
        weeklySpent: user.weeklySpent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    // Reset weekly spending if it's been more than 7 days
    const daysSinceReset = (Date.now() - new Date(user.lastSpentReset).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 7) {
      user.weeklySpent = 0;
      user.lastSpentReset = Date.now();
      await user.save();
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        totalSpent: user.totalSpent,
        weeklySpent: user.weeklySpent,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message,
    });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Wishlist update failed',
      error: error.message,
    });
  }
};

// @desc    Get spending stats
// @route   GET /api/auth/spending
// @access  Private
exports.getSpending = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Reset weekly spending if needed
    const daysSinceReset = (Date.now() - new Date(user.lastSpentReset).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 7) {
      user.weeklySpent = 0;
      user.lastSpentReset = Date.now();
      await user.save();
    }

    res.status(200).json({
      success: true,
      spending: {
        totalSpent: user.totalSpent,
        weeklySpent: user.weeklySpent,
        lastReset: user.lastSpentReset,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spending',
      error: error.message,
    });
  }
};
