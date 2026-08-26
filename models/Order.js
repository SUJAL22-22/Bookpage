const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned'
];

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const orderItemSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String },
  coverImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  itemTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  address: { type: String, required: true },
  area: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  zipCode: { type: String, required: true },
  addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true, default: null },
  customer: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'free'],
    default: 'standard'
  },
  shippingLabel: { type: String, default: 'Standard Delivery' },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'online', 'netbanking', 'wallet'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'Order Placed'
  },
  /** Legacy alias used by older UI — kept in sync with orderStatus */
  status: { type: String, default: 'Order Placed' },
  trackingNumber: { type: String, default: null },
  estimatedDelivery: { type: Date },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
  statusHistory: [{
    status: String,
    at: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.status = this.orderStatus;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
