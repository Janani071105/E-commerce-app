const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product'); 

router.post('/', async (req, res) => {
  try {
    const { productId, orderId, rating, title, description, image } = req.body;

    if (!productId || !rating || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newReview = new Review({
      productId,
      orderId,
      rating,
      title,
      description,
      image
    });

    await newReview.save();

    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)), 
      totalReviews: reviews.length
    });
    

    res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ success: false, message: 'Server error while saving review' });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
      : 0;

    res.json({
      success: true,
      averageRating: Number(averageRating),
      totalReviews,
      reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching reviews' });
  }
});

module.exports = router;