const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');
const {
  generateOrderId,
  generateTrackingNumber,
  buildOrderPricing,
  reduceStock,
  restoreStock,
  canCancel,
  getTimeline,
  COD_MAX_AMOUNT
} = require('../utils/orderHelpers');

/** In-memory orders when MongoDB is unavailable */
const memoryOrders = [];
const memoryPayments = [];

const JWT_SECRET = process.env.JWT_SECRET || 'lumora_secret_key_123';

function optionalAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    req.user = null;
  }
  next();
}

function findMemoryOrder(idOrOrderId) {
  return memoryOrders.find(
    (o) => o.orderId === idOrOrderId || o._id === idOrOrderId
  );
}

async function findOrderDoc(idOrOrderId) {
  if (mongoose.connection?.readyState === 1) {
    try {
      let order = await Order.findOne({ orderId: idOrOrderId });
      if (!order && mongoose.isValidObjectId(idOrOrderId)) {
        order = await Order.findById(idOrOrderId);
      }
      if (order) return { order, source: 'db' };
    } catch (e) {
      console.warn('Order lookup error:', e.message);
    }
  }
  const mem = findMemoryOrder(idOrOrderId);
  if (mem) return { order: mem, source: 'memory' };
  return null;
}

function normalizePaymentMethod(method) {
  const m = (method || 'card').toLowerCase();
  if (['card', 'upi', 'cod', 'online', 'netbanking', 'wallet'].includes(m)) return m;
  return 'card';
}

function paymentStatusFor(method) {
  return method === 'cod' ? 'Pending' : 'Paid';
}

function orderStatusFor(method) {
  return method === 'cod' ? 'Order Placed' : 'Confirmed';
}

// POST create order (COD / simulated online payment)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      items: rawItems,
      shippingAddress,
      paymentMethod: rawPaymentMethod,
      shippingOption
    } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const requiredAddr = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode'];
    for (const field of requiredAddr) {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        return res.status(400).json({ message: `Shipping field required: ${field}` });
      }
    }

    const phone = String(shippingAddress.phone).replace(/\D/g, '');
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid 10-digit mobile number is required' });
    }

    const email = String(shippingAddress.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const paymentMethod = normalizePaymentMethod(rawPaymentMethod);
    const pricing = await buildOrderPricing(rawItems, shippingOption);

    if (paymentMethod === 'cod' && pricing.total > COD_MAX_AMOUNT) {
      return res.status(400).json({
        message: `Cash on Delivery is not available for orders above ₹${COD_MAX_AMOUNT}`
      });
    }

    await reduceStock(pricing.itemsWithSource);

    let orderId = generateOrderId();
    const trackingNumber = generateTrackingNumber();
    const paymentStatus = paymentStatusFor(paymentMethod);
    const orderStatus = orderStatusFor(paymentMethod);

    const orderPayload = {
      orderId,
      userId,
      customer: {
        fullName: shippingAddress.fullName.trim(),
        email,
        phone
      },
      items: pricing.items,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email,
        phone,
        alternatePhone: shippingAddress.alternatePhone || '',
        address: shippingAddress.address.trim(),
        area: shippingAddress.area || '',
        landmark: shippingAddress.landmark || '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state || '',
        country: shippingAddress.country || 'India',
        zipCode: String(shippingAddress.zipCode).trim(),
        addressType: shippingAddress.addressType || 'Home'
      },
      shippingMethod: pricing.shippingMethod,
      shippingLabel: pricing.shippingLabel,
      paymentMethod,
      paymentStatus,
      orderStatus,
      status: orderStatus,
      trackingNumber,
      estimatedDelivery: pricing.estimatedDelivery,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      shippingFee: pricing.shippingFee,
      tax: pricing.tax,
      total: pricing.total,
      statusHistory: [
        { status: 'Order Placed', at: new Date(), note: 'Order created' },
        ...(orderStatus === 'Confirmed'
          ? [{ status: 'Confirmed', at: new Date(), note: 'Payment confirmed' }]
          : [])
      ]
    };

    let savedOrder = null;

    if (mongoose.connection?.readyState === 1) {
      try {
        let existing = await Order.findOne({ orderId });
        while (existing) {
          orderId = generateOrderId();
          orderPayload.orderId = orderId;
          existing = await Order.findOne({ orderId });
        }

        savedOrder = await Order.create(orderPayload);

        try {
          await Payment.create({
            orderId: savedOrder.orderId,
            orderRef: savedOrder._id,
            paymentMethod,
            amount: savedOrder.total,
            currency: 'INR',
            paymentStatus,
            transactionDate: new Date(),
            notes: paymentMethod === 'cod' ? 'Cash on Delivery — pay on delivery' : 'Simulated online payment'
          });
        } catch (payErr) {
          console.warn('Payment record save warning:', payErr.message);
        }

        return res.status(201).json({
          message: 'Order created successfully',
          order: savedOrder
        });
      } catch (dbErr) {
        console.warn('MongoDB order save error, using memory fallback:', dbErr.message);
      }
    }

    const fallbackOrder = {
      _id: 'ord_' + Date.now(),
      ...orderPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryOrders.unshift(fallbackOrder);
    memoryPayments.push({
      orderId: fallbackOrder.orderId,
      paymentMethod,
      amount: fallbackOrder.total,
      paymentStatus,
      transactionDate: new Date().toISOString()
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order: fallbackOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET current user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (mongoose.connection?.readyState === 1) {
      const orders = await Order.find({ userId: String(userId) }).sort({ createdAt: -1 });
      return res.status(200).json({ orders, pagination: { total: orders.length, page: 1 } });
    }

    const orders = memoryOrders.filter((o) => o.userId === String(userId));
    return res.status(200).json({ orders, pagination: { total: orders.length, page: 1 } });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// GET single order
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const found = await findOrderDoc(req.params.id);
    if (!found) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = found.order;
    const orderUserId = order.userId ? String(order.userId) : null;
    const requesterId = req.user?.id ? String(req.user.id) : null;

    // If order belongs to a user and requester is logged in as someone else, block
    if (orderUserId && requesterId && orderUserId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// GET tracking timeline
router.get('/:id/track', optionalAuth, async (req, res) => {
  try {
    const found = await findOrderDoc(req.params.id);
    if (!found) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = found.order;
    const timeline = getTimeline(order);

    return res.json({
      orderId: order.orderId,
      trackingNumber: order.trackingNumber,
      shippingMethod: order.shippingMethod,
      shippingLabel: order.shippingLabel,
      estimatedDelivery: order.estimatedDelivery,
      deliveryAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus || order.status,
      timeline,
      items: order.items,
      total: order.total,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ message: 'Error tracking order', error: error.message });
  }
});

// PATCH cancel order
router.patch('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const found = await findOrderDoc(req.params.id);
    if (!found) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = found.order;
    const orderUserId = order.userId ? String(order.userId) : null;
    const requesterId = req.user?.id ? String(req.user.id) : null;

    if (orderUserId && requesterId && orderUserId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (!canCancel(order)) {
      return res.status(400).json({
        message: 'This order can no longer be cancelled (already shipped or completed).'
      });
    }

    await restoreStock(order.items);

    const reason = (req.body?.reason || 'Cancelled by customer').slice(0, 300);

    if (found.source === 'db') {
      order.orderStatus = 'Cancelled';
      order.status = 'Cancelled';
      order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Failed';
      order.cancelledAt = new Date();
      order.cancelReason = reason;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: 'Cancelled', at: new Date(), note: reason });
      await order.save();

      await Payment.findOneAndUpdate(
        { orderId: order.orderId },
        { paymentStatus: order.paymentStatus }
      );

      return res.json({ message: 'Order cancelled successfully', order });
    }

    order.orderStatus = 'Cancelled';
    order.status = 'Cancelled';
    order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Failed';
    order.cancelledAt = new Date().toISOString();
    order.cancelReason = reason;

    return res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

module.exports = router;
module.exports.memoryOrders = memoryOrders;
