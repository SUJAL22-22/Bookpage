const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');

// In-memory orders store fallback
const memoryOrders = [];

// Helper to generate a random uppercase alphanumeric Order ID (e.g. LMR-748294)
function generateOrderId() {
  const digits = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 3; i++) {
    randomPart += digits.charAt(Math.floor(Math.random() * digits.length));
    randomPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return `LMR-${randomPart}`;
}

// POST create new order
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ message: 'All shipping address fields are required' });
    }
    if (subtotal === undefined || shippingFee === undefined || total === undefined) {
      return res.status(400).json({ message: 'Price breakdown (subtotal, shippingFee, total) is required' });
    }

    // Generate Order ID
    let orderId = generateOrderId();
    
    // 1. Try saving to MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        let existingOrder = await Order.findOne({ orderId });
        while (existingOrder) {
          orderId = generateOrderId();
          existingOrder = await Order.findOne({ orderId });
        }

        const newOrder = new Order({
          orderId,
          items,
          shippingAddress,
          paymentMethod: paymentMethod || 'card',
          subtotal,
          shippingFee,
          total,
          status: 'Paid'
        });

        await newOrder.save();
        return res.status(201).json({ message: 'Order created successfully', order: newOrder });
      } catch (dbErr) {
        console.warn('MongoDB order save error, using fallback:', dbErr.message);
      }
    }

    // 2. Fallback order creation
    const fallbackOrder = {
      _id: 'ord_' + Date.now(),
      orderId,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      subtotal,
      shippingFee,
      total,
      status: 'Paid',
      createdAt: new Date().toISOString()
    };
    memoryOrders.push(fallbackOrder);

    return res.status(201).json({ message: 'Order created successfully', order: fallbackOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

module.exports = router;
