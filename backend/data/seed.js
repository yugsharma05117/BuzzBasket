/**
 * Database Seeder
 * Seeds the database with sample products, admin, demo user, and vendor
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const products = require('./products');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@buzzbasket.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    });
    console.log('👑 Admin user created (admin@buzzbasket.com / admin123)');

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@buzzbasket.com',
      password: 'demo123',
      role: 'user',
      phone: '9876543211',
      address: {
        street: '456 Demo Lane',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    });
    console.log('👤 Demo user created (demo@buzzbasket.com / demo123)');

    // Create demo vendor user
    const vendorUser = await User.create({
      name: 'Fresh Mart',
      email: 'vendor@buzzbasket.com',
      password: 'vendor123',
      role: 'vendor',
      phone: '9876543212',
    });

    // Create vendor profile
    const vendor = await Vendor.create({
      user: vendorUser._id,
      storeName: 'Fresh Mart Groceries',
      storeDescription: 'Premium quality fruits, vegetables and daily essentials at best prices',
      category: 'General',
      status: 'approved',
      phone: '9876543212',
      address: {
        street: '789 Market Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
      },
    });
    console.log('🏪 Vendor created (vendor@buzzbasket.com / vendor123)');

    // Insert platform products (no vendor)
    const insertedProducts = await Product.insertMany(products);
    console.log(`📦 ${insertedProducts.length} platform products seeded`);

    // Create a few vendor products
    const vendorProducts = [
      { vendor: vendor._id, name: 'Organic Red Apples', description: 'Fresh organic apples from Shimla orchards', price: 180, originalPrice: 220, category: 'Fruits', stock: 50, unit: 'kg', emoji: '🍎', isBudgetFriendly: false, isOrganic: true, brand: 'Fresh Mart', discount: 18 },
      { vendor: vendor._id, name: 'Farm Fresh Tomatoes', description: 'Locally sourced vine-ripened tomatoes', price: 35, originalPrice: 45, category: 'Vegetables', stock: 100, unit: 'kg', emoji: '🍅', isBudgetFriendly: true, isOrganic: true, brand: 'Fresh Mart', discount: 22 },
      { vendor: vendor._id, name: 'Premium Basmati Rice', description: 'Aged long-grain basmati rice', price: 250, originalPrice: 300, category: 'Grains', stock: 30, unit: 'kg', emoji: '🍚', isBudgetFriendly: false, isOrganic: false, brand: 'Fresh Mart', discount: 17 },
      { vendor: vendor._id, name: 'Fresh Paneer', description: 'Soft and creamy fresh paneer', price: 90, originalPrice: 110, category: 'Dairy', stock: 40, unit: 'pcs', emoji: '🧀', isBudgetFriendly: true, isOrganic: false, brand: 'Fresh Mart', discount: 18 },
    ];
    await Product.insertMany(vendorProducts);
    vendor.totalProducts = vendorProducts.length;
    await vendor.save();
    console.log(`📦 ${vendorProducts.length} vendor products seeded`);

    // Set up product alternatives
    const allProducts = await Product.find({});
    const productMap = {};
    allProducts.forEach((p) => {
      if (!productMap[p.category]) productMap[p.category] = [];
      productMap[p.category].push(p);
    });

    for (const category of Object.keys(productMap)) {
      const categoryProducts = productMap[category].sort((a, b) => a.price - b.price);
      for (let i = 1; i < categoryProducts.length; i++) {
        const cheaperAlternatives = categoryProducts.slice(0, i).map((p) => p._id);
        await Product.findByIdAndUpdate(categoryProducts[i]._id, {
          alternatives: cheaperAlternatives.slice(0, 3),
        });
      }
    }
    console.log('🔗 Product alternatives linked');

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:  admin@buzzbasket.com / admin123');
    console.log('Demo Login:   demo@buzzbasket.com / demo123');
    console.log('Vendor Login: vendor@buzzbasket.com / vendor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
