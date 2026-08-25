const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

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
    
    // Ensure uniqueness (in case of rare collision)
    let existingOrder = await Order.findOne({ orderId });
    while (existingOrder) {
      orderId = generateOrderId();
      existingOrder = await Order.findOne({ orderId });
    }

    // Create order document
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
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

module.exports = router;
