const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Subscriber = require('../models/Subscriber');

// In-memory subscribers store fallback
const memorySubscribers = new Set();

// POST new subscriber
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try saving to MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const existingSubscriber = await Subscriber.findOne({ email: normalizedEmail });
        if (existingSubscriber) {
          return res.status(400).json({ message: 'Email already subscribed' });
        }

        const subscriber = new Subscriber({ email: normalizedEmail });
        await subscriber.save();
        
        return res.status(201).json({ message: 'Successfully subscribed', subscriber });
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          return res.status(400).json({ message: 'Email already subscribed' });
        }
        console.warn('MongoDB subscriber save error, using fallback:', dbErr.message);
      }
    }

    // 2. Fallback in-memory save
    if (memorySubscribers.has(normalizedEmail)) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    memorySubscribers.add(normalizedEmail);

    res.status(201).json({
      message: 'Successfully subscribed',
      subscriber: { email: normalizedEmail, createdAt: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing', error: error.message });
  }
});

module.exports = router;
