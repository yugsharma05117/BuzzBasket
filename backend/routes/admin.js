/**
 * Admin Routes
 */
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  deleteUser,
  getAllVendors,
  updateVendorStatus,
  getAllProducts,
  removeProduct,
  getAllOrders,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/products', getAllProducts);
router.delete('/products/:id', removeProduct);
router.get('/orders', getAllOrders);

module.exports = router;
