const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 
const mongoose = require('mongoose');
const Seller = require('./models/Seller');
require('dotenv').config();

const MONGO_URI = 'mongodb+srv://jananivasu2005_db_user:12345@cluster0.lcmmlzr.mongodb.net/test?appName=Cluster0';

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    await Seller.deleteMany({}); 

    await Seller.create({
      storeName: 'TechHub Electronics',
      ownerName: 'Janani V',
      email: 'jananivasu2005@gmail.com',
      status: 'Active',
      grossRevenue: 12400
    });

    console.log('Sample seller added successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
}

seedDB();