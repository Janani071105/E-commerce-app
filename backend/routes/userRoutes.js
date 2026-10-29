const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const User = require('../models/User');
const { logActivity } = require('../utils/logger');
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});
router.post('/add-to-cart', async (req, res) => {
  try {
    if (req.user) {
      await logActivity({
        accountType: 'User',
        entityId: req.user._id,
        entityName: `${req.user.name} (#${req.user._id.toString().slice(-3)})`,
        actionDetail: 'Added items to cart'
      });
    }
    res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;