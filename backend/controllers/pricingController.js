/**
 * Pricing Insights Controller
 * Vendor Competition Engine - compare prices, get optimization suggestions
 */
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Get pricing insights for a vendor's product
// @route   GET /api/pricing-insights/:productId
// @access  Private/Vendor
exports.getProductInsights = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const product = await Product.findOne({ _id: req.params.productId, vendor: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not yours' });
    }

    // Find similar products from other vendors in the same category
    const competitors = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      name: { $regex: product.name.split(' ')[0], $options: 'i' },
      vendor: { $ne: vendor._id },
      isActive: true,
    }).populate('vendor', 'storeName');

    if (competitors.length === 0) {
      return res.status(200).json({
        success: true,
        product: { id: product._id, name: product.name, price: product.price },
        insights: {
          competitorCount: 0,
          message: 'No direct competitors found for this product',
          suggestions: ['You have no direct competition - consider optimizing price for customer retention'],
        },
        competitors: [],
      });
    }

    const prices = competitors.map(c => c.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceDiff = ((product.price - avgPrice) / avgPrice * 100).toFixed(1);

    // Generate insights
    const insights = {
      competitorCount: competitors.length,
      averagePrice: Math.round(avgPrice),
      minPrice,
      maxPrice,
      yourPrice: product.price,
      priceDifference: Number(priceDiff),
      pricePosition: product.price < avgPrice ? 'below_average' : product.price > avgPrice ? 'above_average' : 'at_average',
    };

    // Generate suggestions
    const suggestions = [];
    if (Number(priceDiff) > 15) {
      suggestions.push(`Your price is ${priceDiff}% higher than average. Consider reducing by ₹${Math.round(product.price - avgPrice)} to be competitive.`);
      suggestions.push(`The lowest competitor price is ₹${minPrice}. Matching it could increase sales significantly.`);
    } else if (Number(priceDiff) > 5) {
      suggestions.push(`Your price is ${priceDiff}% above average. A small reduction of ₹${Math.round(product.price - avgPrice)} could improve competitiveness.`);
    } else if (Number(priceDiff) < -10) {
      suggestions.push(`Your price is ${Math.abs(priceDiff)}% below average! You could increase by ₹${Math.round(avgPrice - product.price)} while staying competitive.`);
    } else {
      suggestions.push('Your pricing is competitive! Maintain this strategy for strong positioning.');
    }

    // Optimal price suggestion
    const optimalPrice = Math.round(avgPrice * 0.95); // 5% below average
    suggestions.push(`Optimal suggested price: ₹${optimalPrice} (5% below average for competitive edge)`);

    insights.suggestions = suggestions;

    res.status(200).json({
      success: true,
      product: { id: product._id, name: product.name, price: product.price, category: product.category },
      insights,
      competitors: competitors.map(c => ({
        name: c.name,
        price: c.price,
        vendor: c.vendor?.storeName || 'Unknown',
        discount: c.discount,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing insights',
      error: error.message,
    });
  }
};

// @desc    Get overall competition overview for vendor
// @route   GET /api/pricing-insights/overview
// @access  Private/Vendor
exports.getCompetitionOverview = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const myProducts = await Product.find({ vendor: vendor._id, isActive: true });

    const analysis = [];

    for (const product of myProducts) {
      const competitors = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        name: { $regex: product.name.split(' ')[0], $options: 'i' },
        vendor: { $ne: vendor._id },
        isActive: true,
      });

      if (competitors.length > 0) {
        const avgPrice = competitors.reduce((a, b) => a + b.price, 0) / competitors.length;
        const priceDiff = ((product.price - avgPrice) / avgPrice * 100).toFixed(1);

        analysis.push({
          productId: product._id,
          productName: product.name,
          yourPrice: product.price,
          avgCompetitorPrice: Math.round(avgPrice),
          priceDifference: Number(priceDiff),
          competitorCount: competitors.length,
          status: Number(priceDiff) > 10 ? 'overpriced' : Number(priceDiff) < -10 ? 'underpriced' : 'competitive',
        });
      }
    }

    // Summary stats
    const overpriced = analysis.filter(a => a.status === 'overpriced').length;
    const underpriced = analysis.filter(a => a.status === 'underpriced').length;
    const competitive = analysis.filter(a => a.status === 'competitive').length;

    res.status(200).json({
      success: true,
      summary: {
        totalAnalyzed: analysis.length,
        overpriced,
        underpriced,
        competitive,
        competitivenessScore: analysis.length > 0
          ? Math.round((competitive / analysis.length) * 100)
          : 100,
      },
      products: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch competition overview',
      error: error.message,
    });
  }
};
