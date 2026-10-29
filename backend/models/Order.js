const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  fulfillmentStatus: { type: String, default: 'Processing' },
  trackingNumber: { type: String, default: 'Pending' },
  estimatedDeliveryDate: { type: String, default: 'TBD' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);