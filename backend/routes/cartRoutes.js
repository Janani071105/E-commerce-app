const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Cart = require('../models/cart');

router.get('/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(200).json({ success: true, items: [] });
    }
    res.status(200).json({ success: true, items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { userId = 'guest_user', product } = req.body;
  const productId = product.productId || product._id || product.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          productId,
          title: product.title || product.name,
          price: Number(product.price),
          image: product.image,
          quantity: Number(product.quantity) || 1
        }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = product.quantity !== undefined 
          ? Number(product.quantity) 
          : cart.items[itemIndex].quantity + 1;
      } else {
        cart.items.push({
          productId,
          title: product.title || product.name,
          price: Number(product.price),
          image: product.image,
          quantity: Number(product.quantity) || 1
        });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Cart updated successfully', items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
    await cart.save();

    res.status(200).json({ success: true, message: 'Item removed', items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/clear/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;