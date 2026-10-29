const mongoose = require('mongoose');
const sellerSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  grossRevenue: { type: Number, default: 0 }
});

module.exports = mongoose.model('Seller', sellerSchema);