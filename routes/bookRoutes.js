const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { FALLBACK_BOOKS, fallbackStock } = require('../data/fallbackBooks');

function withLiveStock(books) {
  return books.map((b) => {
    const id = String(b._id);
    const stock = fallbackStock.has(id) ? fallbackStock.get(id) : b.stock;
    return { ...b, stock };
  });
}

// GET all books
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const books = await Book.find().sort({ createdAt: -1 });
      if (books && books.length > 0) {
        return res.json(books);
      }
    }
  } catch (error) {
    console.warn('MongoDB fetch error, returning fallback books:', error.message);
  }
  return res.json(withLiveStock(FALLBACK_BOOKS));
});

// GET single book by ID
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const book = await Book.findById(req.params.id);
      if (book) return res.json(book);
    }
  } catch (error) {
    console.warn('MongoDB findById error:', error.message);
  }

  const fallback = FALLBACK_BOOKS.find(b => b._id === req.params.id);
  if (fallback) {
    const stock = fallbackStock.has(String(fallback._id))
      ? fallbackStock.get(String(fallback._id))
      : fallback.stock;
    return res.json({ ...fallback, stock });
  }

  res.status(404).json({ message: 'Book not found' });
});

// GET books by category
router.get('/category/:category', async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const books = await Book.find({ category: req.params.category }).sort({ createdAt: -1 });
      if (books && books.length > 0) return res.json(books);
    }
  } catch (error) {
    console.warn('MongoDB category fetch error:', error.message);
  }

  const filtered = FALLBACK_BOOKS.filter(b => b.category.toLowerCase() === req.params.category.toLowerCase());
  const list = withLiveStock(filtered.length > 0 ? filtered : FALLBACK_BOOKS);
  res.json(list);
});

module.exports = router;
