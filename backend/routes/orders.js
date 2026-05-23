/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/', placeOrder);
router.get('/', getOrders);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

// Get single order (must be after /admin/all to avoid route conflict)
router.get('/:id', getOrder);

module.exports = router;
