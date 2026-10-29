const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/products', upload.array('images', 10), async (req, res) => {
  try {
    const imageUrls = req.files 
      ? req.files.map(file => `http://localhost:4000/uploads/${file.filename}`) 
      : [];

    const newProduct = new Product({
      ...req.body,
      images: imageUrls, 
      imageUrl: imageUrls[0] || '' 
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, product: savedProduct });
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put(['/product-statuses/:id', '/products/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.unitPrice !== undefined) updateData.price = req.body.unitPrice;
    if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    if (req.body.availableStock !== undefined) updateData.stock = req.body.availableStock;
    
    const finalData = Object.keys(updateData).length > 0 ? updateData : req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      finalData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/customers', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const customerMap = {};
    orders.forEach(order => {
      if (order.customerName) {
        if (!customerMap[order.customerName]) {
          customerMap[order.customerName] = {
            name: order.customerName,
            email: order.customerEmail || 'N/A',
            phone: order.customerPhone || 'N/A',
            latestOrderDate: order.createdAt || new Date(),
            totalOrders: 1
          };
        } else {
          customerMap[order.customerName].totalOrders += 1;
        }
      }
    });

    const customers = Object.values(customerMap);
    res.json({ success: true, customers });
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/products/:productId/orders', async (req, res) => {
  try {
    const { productId } = req.params;
    const allOrders = await Order.find({});
    
    let orders = allOrders.filter(order => 
      order.items && order.items.some(item => item.productId && item.productId.toString() === productId.toString())
    );
    if (orders.length === 0 && allOrders.length > 0) {
      orders = allOrders;
    }
    const formattedOrders = orders.map(order => {
      const matchingItem = order.items.find(item => 
        item.productId && item.productId.toString() === productId.toString()
      ) || order.items[0];

      return {
        id: order._id,
        buyer: order.customerName,
        quantityOrdered: matchingItem?.quantity || 1,
        status: order.fulfillmentStatus,
        trackingNo: order.trackingNumber || 'Pending',
        estimatedDelivery: order.estimatedDeliveryDate || 'TBD'
      };
    });
    res.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("Error fetching product orders:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router; 