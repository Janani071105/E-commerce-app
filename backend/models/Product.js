const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  rating: { type: Number, default: 0 },      
  totalReviews: { type: Number, default: 0 }, 
  stock: { type: Number, required: true },
  description: { type: String },
  features: { type: [String] },
  images: { type: [String] },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);