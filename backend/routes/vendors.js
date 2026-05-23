/**
 * Vendor Routes
 */
const express = require('express');
const router = express.Router();
const {
  registerVendor,
  getVendorProfile,
  getDashboard,
  getVendorProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorOrders,
  updateVendorOrderStatus,
} = require('../controllers/vendorController');
const { protect, vendorOnly } = require('../middleware/auth');

// All vendor routes require authentication
router.use(protect);

// Registration (any authenticated user can apply)
router.post('/register', registerVendor);

// Vendor-only routes
router.get('/profile', vendorOnly, getVendorProfile);
router.get('/dashboard', vendorOnly, getDashboard);
router.get('/products', vendorOnly, getVendorProducts);
router.post('/products', vendorOnly, addProduct);
router.put('/products/:id', vendorOnly, updateProduct);
router.delete('/products/:id', vendorOnly, deleteProduct);
router.get('/orders', vendorOnly, getVendorOrders);
router.put('/orders/:id/status', vendorOnly, updateVendorOrderStatus);

module.exports = router;
