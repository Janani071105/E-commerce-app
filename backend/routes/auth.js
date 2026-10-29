const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (!user.activities) user.activities = [];
    user.activities.unshift({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: 'Logged in successfully'
    });
    await user.save();

    res.status(200).json({ success: true, message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(['/signup', '/register'], async (req, res) => {
  console.log("Incoming signup request body:", req.body);

  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(" User already exists in DB:", email);
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      activities: [
        { date: new Date().toISOString().replace('T', ' ').substring(0, 16), action: 'Created account' }
      ]
    });

    const savedUser = await newUser.save();
    console.log(" SUCCESS! User saved to database:", savedUser);

    res.status(201).json({ success: true, message: "Account created successfully! Please log in.", user: savedUser });
  } catch (err) {
    console.error("CRITICAL DATABASE ERROR during signup:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;