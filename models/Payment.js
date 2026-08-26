const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  orderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'online', 'netbanking', 'wallet'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionDate: { type: Date, default: Date.now },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
