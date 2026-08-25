const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  genre: { type: String, required: true },
  coverImage: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  pages: { type: Number, required: true },
  language: { type: String, default: 'English' },
  publisher: { type: String },
  publicationDate: { type: String },
  publicationYear: { type: Number, required: true },
  stock: { type: Number, default: 10 },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
