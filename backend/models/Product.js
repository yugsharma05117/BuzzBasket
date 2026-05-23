/**
 * Product Model
 * Stores grocery product information with categories, pricing, and ratings
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null, // null for platform/admin products
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0, // Used for showing discounts
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Grains', 'Meat', 'Bakery', 'Frozen', 'Household'],
    },
    image: {
      type: String,
      default: '/images/default-product.png',
    },
    emoji: {
      type: String,
      default: '🛒',
    },
    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'dozen'],
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Stock cannot be negative'],
    },
    isBudgetFriendly: {
      type: Boolean,
      default: false,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      default: 'BuzzBasket',
    },
    ratings: {
      average: { type: Number, default: 4.0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: [String],
    discount: {
      type: Number,
      default: 0, // Percentage discount
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    alternatives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
