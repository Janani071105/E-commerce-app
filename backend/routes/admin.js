const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User'); 
const Seller = require('../models/Seller'); 
const mongoose = require('mongoose'); 

router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalBuyers = await User.countDocuments();
    const totalSellers = await Seller.countDocuments();
    
    res.json({
      totalBuyers,
      totalSellers,
      systemStatus: "Optimal",
      totalAmount: 17350.00 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const buyers = await User.find();
    const sellers = await Seller.find();
    const formattedBuyers = buyers.map(user => ({
      id: user._id,
      name: user.name || user.username || 'Unnamed User',
      email: user.email,
      phone: user.phone || 'N/A',
      location: user.location || 'N/A',
      tier: user.tier || 'Standard',
      totalSpent: user.totalSpent ? `$${user.totalSpent}` : '$0.00',
      status: user.status || 'Active',
      role: 'User',
      joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));
    const formattedSellers = sellers.map(seller => ({
      id: seller._id,
      name: seller.name || 'Unnamed Owner',
      storeName: seller.storeName || 'Unnamed Store',
      email: seller.email,
      phone: seller.phone || 'N/A',
      category: seller.category || 'General',
      totalRevenue: seller.totalRevenue ? `$${seller.totalRevenue}` : '$0.00',
      status: seller.status || 'Active',
      role: 'Seller',
      joined: seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'
    }));
    res.json([...formattedBuyers, ...formattedSellers]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/users', async (req, res) => {
  try {
    const buyers = await User.find();
    const sellers = await Seller.find();
    const formattedBuyers = buyers.map(user => ({
      id: user._id,
      name: user.name || user.username || 'Unnamed User',
      email: user.email,
      phone: user.phone || 'N/A',
      location: user.location || 'N/A',
      tier: user.tier || 'Standard',
      totalSpent: user.totalSpent ? `$${user.totalSpent}` : '$0.00',
      status: user.status || 'Active',
      role: 'User',
      joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));
    const formattedSellers = sellers.map(seller => ({
      id: seller._id,
      name: seller.name || 'Unnamed Owner',
      storeName: seller.storeName || 'Unnamed Store',
      email: seller.email,
      phone: seller.phone || 'N/A',
      category: seller.category || 'General',
      totalRevenue: seller.totalRevenue ? `$${seller.totalRevenue}` : '$0.00',
      status: seller.status || 'Active',
      role: 'Seller',
      joined: seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'
    }));

    res.json([...formattedBuyers, ...formattedSellers]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;