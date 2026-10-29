const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Wishlist = require('../models/Wishlist');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(200).json({ success: true, items: [] });
    }
    
    res.status(200).json({ success: true, items: wishlist.items });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { userId, product } = req.body;
    const productId = product._id || product.id;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [{ productId, ...product }]
      });
    } else {
      const exists = wishlist.items.some(item => item.productId.toString() === productId.toString());
      if (!exists) {
        wishlist.items.push({ productId, ...product });
      }
    }

    wishlist.updatedAt = Date.now();
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Added to wishlist', items: wishlist.items });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId.toString());
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Removed from wishlist', items: wishlist.items });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;