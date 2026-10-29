const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/userRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sellerOrderRoutes = require('./routes/sellerOrderRoutes');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlistRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seller', sellerRoutes); 
app.use('/uploads', express.static('uploads'));
app.use('/api/cart', cartRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Unread', 'Pending', 'Replied', 'Completed'], default: 'Unread' },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jananivasu2005@gmail.com',
    pass: 'otnp ruwg tike wsdq' 
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newContact = new Contact({ name, email, subject, message, status: 'Unread' });
    await newContact.save();
    console.log("Message saved to MongoDB!");

    const mailOptions = {
      from: 'jananivasu2005@gmail.com',
      to: email, 
      subject: 'HEXCART - Thank You for Your Message!',
      text: `Hi ${name},\n\nThank you for reaching out to HEXCART! We have successfully received your query regarding "${subject}". Our team will get back to you shortly.\n\nBest regards,\nHEXCART Team`
    };

    await transporter.sendMail(mailOptions);
    console.log("Confirmation email successfully sent to:", email);

    res.status(201).json({ success: true, message: 'Message saved and email sent successfully!' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/admin/contacts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    const mailOptions = {
      from: 'jananivasu2005@gmail.com',
      to: contact.email,                                           
      subject: `Re: ${contact.subject} - HEXCART Support`,
      text: `Hi ${contact.name},\n\n${replyMessage}\n\nBest regards,\nHEXCART Support Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reply email successfully sent to customer: ${contact.email}`);
    contact.status = 'Replied';
    await contact.save();

    res.status(200).json({ 
      success: true, 
      message: 'Reply sent and status updated successfully!',
      updatedContact: contact 
    });

  } catch (err) {
    console.error('Error sending admin reply:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

app.put('/api/admin/contacts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({ success: true, message: 'Status updated successfully!', updatedContact: contact });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

mongoose.set('bufferCommands', false);
const MONGO_URI = 'mongodb+srv://jananivasu2005_db_user:12345@cluster0.lcmmlzr.mongodb.net/test?appName=Cluster0';

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});