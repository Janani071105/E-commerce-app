const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId') 
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      let totalAmount = 0;
      const formattedItems = order.items.map(item => {
        const prod = item.productId || {};
        const price = prod.price || 0;
        totalAmount += price * item.quantity;
        return {
          title: prod.title || prod.name || 'Unknown Product',
          price: price,
          quantity: item.quantity
        };
      });

      return {
        _id: order._id,
        createdAt: order.createdAt,
        status: order.fulfillmentStatus || 'Processing',
        totalAmount: totalAmount,
        items: formattedItems
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items, customerName } = req.body;
    const formattedItems = items.map(item => ({
      productId: item._id || item.id,
      quantity: item.quantity
    }));

    const newOrder = new Order({
      customerName: customerName || 'Valued Customer',
      fulfillmentStatus: 'Processing',
      trackingNumber: 'PENDING-' + Math.floor(1000 + Math.random() * 9000),
      estimatedDeliveryDate: '3-5 Business Days',
      items: formattedItems
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Server error while placing order' });
  }
});

module.exports = router;