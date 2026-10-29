const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Product = require('../models/Product');
const Review = require('../models/Review');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    const productsWithRatings = await Promise.all(products.map(async (product) => {
      const productId = product._id;
      const reviews = await Review.find({ productId });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0; 

      return {
        ...product,
        averageRating,
        totalReviews
      };
    }));

    res.json({ success: true, products: productsWithRatings });
  } catch (err) {
    console.error('Error fetching products with ratings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;