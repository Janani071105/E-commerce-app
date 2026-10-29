const Contact = require('./models/Contact'); 
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    const mailOptions = {
      from: 'your-actual-email@gmail.com', 
      to: email, 
      subject: 'HEXCART - Message Received!',
      text: `Hi ${name},\n\nThank you for reaching out to HEXCART! Your message has been successfully sent. Our team will get back to you shortly.\n\nBest regards,\nHEXCART Team`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Message sent and confirmation email delivered!' });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});