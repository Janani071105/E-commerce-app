const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  action: { type: String, required: true }
});
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Seller', 'Admin'], default: 'User' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  phone: { type: String, default: '+1 (555) 000-0000' },
  location: { type: String, default: 'United States' },
  tier: { type: String, default: 'Standard Member' },
  totalSpent: { type: String, default: '$0.00' },
  storeName: { type: String },
  category: { type: String },
  totalRevenue: { type: String, default: '$0.00' },
  activities: [activitySchema]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);