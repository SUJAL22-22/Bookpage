const mongoose = require('mongoose');
const Book = require('../models/Book');
const { FALLBACK_BOOKS, fallbackStock } = require('../data/fallbackBooks');

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 50;
const EXPRESS_SHIPPING = 150;
const COD_MAX_AMOUNT = 10000;

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

function generateTrackingNumber() {
  const n = Math.floor(100000000 + Math.random() * 900000000);
  return `LMRTRK${n}`;
}

function addBusinessDays(fromDate, days) {
  const result = new Date(fromDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function resolveShipping(shippingOption, subtotal) {
  const option = shippingOption || 'standard';
  if (subtotal >= FREE_SHIPPING_THRESHOLD && option !== 'express') {
    return {
      shippingMethod: 'free',
      shippingLabel: 'Free Delivery',
      shippingFee: 0,
      estimatedDaysMin: 5,
      estimatedDaysMax: 7
    };
  }
  if (option === 'express') {
    return {
      shippingMethod: 'express',
      shippingLabel: 'Express Delivery (2–3 Business Days)',
      shippingFee: EXPRESS_SHIPPING,
      estimatedDaysMin: 2,
      estimatedDaysMax: 3
    };
  }
  return {
    shippingMethod: 'standard',
    shippingLabel: 'Standard Delivery (5–7 Business Days)',
    shippingFee: STANDARD_SHIPPING,
    estimatedDaysMin: 5,
    estimatedDaysMax: 7
  };
}

async function findBookById(bookId) {
  const id = String(bookId);
  if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
    try {
      const book = await Book.findById(id);
      if (book) return { book, source: 'db' };
    } catch (e) {
      /* fall through */
    }
  }
  const fallback = FALLBACK_BOOKS.find((b) => String(b._id) === id);
  if (fallback) {
    const stock = fallbackStock.has(id) ? fallbackStock.get(id) : fallback.stock;
    return { book: { ...fallback, stock }, source: 'fallback' };
  }
  return null;
}

/**
 * Recalculate line items + totals from trusted catalog prices.
 * Never trust frontend price/total values.
 */
async function buildOrderPricing(rawItems, shippingOption) {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    throw Object.assign(new Error('Cart items are required'), { status: 400 });
  }

  const items = [];
  let subtotal = 0;
  let discount = 0;

  for (const raw of rawItems) {
    const qty = parseInt(raw.quantity, 10);
    if (!raw.bookId || !Number.isFinite(qty) || qty < 1) {
      throw Object.assign(new Error('Invalid item quantity'), { status: 400 });
    }

    const found = await findBookById(raw.bookId);
    if (!found) {
      throw Object.assign(new Error(`Book not found: ${raw.bookId}`), { status: 400 });
    }

    const { book, source } = found;
    const stock = Number(book.stock);
    if (!Number.isFinite(stock) || stock < qty) {
      throw Object.assign(
        new Error(`Insufficient stock for "${book.title}". Available: ${Math.max(0, stock || 0)}`),
        { status: 400 }
      );
    }

    const unitPrice = Number(book.price);
    const originalPrice = Number(book.originalPrice || book.price);
    const itemTotal = unitPrice * qty;
    const lineDiscount = Math.max(0, (originalPrice - unitPrice) * qty);

    subtotal += itemTotal;
    discount += lineDiscount;

    items.push({
      bookId: String(book._id),
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      quantity: qty,
      price: unitPrice,
      originalPrice,
      itemTotal,
      _source: source
    });
  }

  const shipping = resolveShipping(shippingOption, subtotal);
  const tax = 0;
  const total = subtotal + shipping.shippingFee + tax;
  const estimatedDelivery = addBusinessDays(new Date(), shipping.estimatedDaysMax);

  return {
    items: items.map(({ _source, ...rest }) => rest),
    itemsWithSource: items,
    subtotal,
    discount,
    tax,
    shippingFee: shipping.shippingFee,
    shippingMethod: shipping.shippingMethod,
    shippingLabel: shipping.shippingLabel,
    total,
    estimatedDelivery
  };
}

async function reduceStock(itemsWithSource) {
  for (const item of itemsWithSource) {
    if (item._source === 'db' && mongoose.connection?.readyState === 1) {
      const updated = await Book.findOneAndUpdate(
        { _id: item.bookId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        throw Object.assign(new Error(`Stock update failed for "${item.title}"`), { status: 409 });
      }
    } else {
      const id = String(item.bookId);
      const current = fallbackStock.get(id) ?? 0;
      if (current < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for "${item.title}"`), { status: 409 });
      }
      fallbackStock.set(id, current - item.quantity);
    }
  }
}

async function restoreStock(orderItems) {
  for (const item of orderItems) {
    const id = String(item.bookId);
    if (mongoose.connection?.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        await Book.findByIdAndUpdate(id, { $inc: { stock: item.quantity } });
        continue;
      } catch (e) {
        /* fall through to fallback map */
      }
    }
    const current = fallbackStock.get(id);
    if (current !== undefined) {
      fallbackStock.set(id, current + item.quantity);
    }
  }
}

function canCancel(order) {
  const status = order.orderStatus || order.status || '';
  const blocked = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
  return !blocked.includes(status);
}

function getTimeline(order) {
  const steps = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];
  const current = order.orderStatus || order.status || 'Order Placed';
  if (current === 'Cancelled' || current === 'Returned') {
    return {
      cancelled: true,
      current,
      steps: steps.map((s) => ({ status: s, completed: false, active: false }))
    };
  }
  const idx = steps.indexOf(current);
  const activeIdx = idx >= 0 ? idx : 0;
  return {
    cancelled: false,
    current,
    steps: steps.map((s, i) => ({
      status: s,
      completed: i < activeIdx,
      active: i === activeIdx
    }))
  };
}

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING,
  COD_MAX_AMOUNT,
  generateOrderId,
  generateTrackingNumber,
  resolveShipping,
  buildOrderPricing,
  reduceStock,
  restoreStock,
  canCancel,
  getTimeline,
  findBookById
};
