/**
 * Product Routes
 */
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getCategories,
  getAlternatives,
  getBudgetFriendly,
  createProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/categories', getCategories);
router.get('/budget-friendly', getBudgetFriendly);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/alternatives', getAlternatives);

// Protected routes
router.post('/:id/rate', protect, rateProduct);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
