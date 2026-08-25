const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// In-memory user store fallback if MongoDB is unreachable
const memoryUsers = new Map();

// Helper to generate token with embedded user info
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'lumora_secret_key_123',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try registering with MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
          return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword
        });

        if (user) {
          return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user)
          });
        }
      } catch (dbError) {
        console.warn('MongoDB register error, using fallback:', dbError.message);
      }
    }

    // 2. Resilient fallback in-memory user registration
    if (memoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fakeId = 'usr_' + Date.now();
    
    const memUser = {
      _id: fakeId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    };
    memoryUsers.set(normalizedEmail, memUser);

    return res.status(201).json({
      _id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      token: generateToken(memUser)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try logging in with MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await bcrypt.compare(password, user.password))) {
          return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user)
          });
        } else if (user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } catch (dbError) {
        console.warn('MongoDB login error, checking fallback store:', dbError.message);
      }
    }

    // 2. Check in-memory store fallback
    const memUser = memoryUsers.get(normalizedEmail);
    if (memUser && (await bcrypt.compare(password, memUser.password))) {
      return res.json({
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        token: generateToken(memUser)
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user) {
      return res.json(req.user);
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

module.exports = router;
