const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');

// In-memory contacts store fallback
const memoryContacts = [];

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate request
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message) are required' });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // 1. Try saving to MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const contact = new Contact({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim()
        });

        await contact.save();

        return res.status(201).json({
          message: 'Contact form submitted successfully',
          contact: {
            id: contact._id,
            name: contact.name,
            email: contact.email,
            createdAt: contact.createdAt
          }
        });
      } catch (dbErr) {
        console.warn('MongoDB contact save error, using fallback:', dbErr.message);
      }
    }

    // 2. Fallback in-memory save
    const fallbackContact = {
      id: 'cnt_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    memoryContacts.push(fallbackContact);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact: fallbackContact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Server error processing contact form', error: error.message });
  }
});

module.exports = router;
