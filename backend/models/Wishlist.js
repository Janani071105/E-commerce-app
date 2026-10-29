const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  items: [{
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed },
    originalPrice: { type: mongoose.Schema.Types.Mixed },
    image: { type: String },
    keyFeatures: { type: mongoose.Schema.Types.Mixed }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);