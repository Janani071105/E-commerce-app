const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  try {
    const { items, customerName } = req.body;
    const formattedItems = items.map(item => ({
      productId: item._id || item.id,
      quantity: item.quantity
    }));

    const newOrder = new Order({
      customerName: customerName || 'Guest User',
      fulfillmentStatus: 'Processing',
      trackingNumber: 'Pending',
      estimatedDeliveryDate: '3-5 Business Days',
      items: formattedItems
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Server error while placing order' });
  }
});
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId') 
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
});

module.exports = router;