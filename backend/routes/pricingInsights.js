/**
 * Pricing Insights Routes (Vendor Competition Engine)
 */
const express = require('express');
const router = express.Router();
const { getProductInsights, getCompetitionOverview } = require('../controllers/pricingController');
const { protect, vendorOnly } = require('../middleware/auth');

// All pricing insight routes require vendor authentication
router.use(protect);
router.use(vendorOnly);

router.get('/overview', getCompetitionOverview);
router.get('/:productId', getProductInsights);

module.exports = router;
