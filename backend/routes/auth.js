/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, toggleWishlist, getSpending } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/spending', protect, getSpending);

module.exports = router;
