const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// POST new subscriber
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();
    
    res.status(201).json({ message: 'Successfully subscribed', subscriber });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    res.status(500).json({ message: 'Error subscribing', error: error.message });
  }
});

module.exports = router;
