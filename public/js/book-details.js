// ============================================
// LUMORA BOOKS - BOOK DETAILS CONTROLLER
// ============================================

let currentBook = null;

// DOM Elements
const bookDetailsGrid = document.getElementById('bookDetailsGrid');
const relatedGrid = document.getElementById('relatedGrid');
const relatedBooksSection = document.getElementById('relatedBooksSection');

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  if (!bookId) {
    window.location.href = '/books.html';
    return;
  }

  await loadBookDetails(bookId);
});

// Load Book Details from API
async function loadBookDetails(id) {
  try {
    const response = await fetch(`/api/books/${id}`);
    if (!response.ok) throw new Error('Book not found');
    
    currentBook = await response.json();
    renderBookDetails(currentBook);
    loadRelatedBooks(currentBook.category, currentBook._id);
  } catch (error) {
    console.error('Error loading book details:', error);
    if (bookDetailsGrid) {
      bookDetailsGrid.innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 5rem 0;">
          <h2 style="font-size: 2rem; color: var(--burgundy); margin-bottom: 15px;">Book Not Found</h2>
          <p style="color: var(--muted); margin-bottom: 2rem;">The book you are looking for does not exist or has been removed.</p>
          <a href="/books.html" class="btn btn-primary">BACK TO CATALOG</a>
        </div>
      `;
    }
  }
}

// Render book details HTML
function renderBookDetails(book) {
  if (!bookDetailsGrid) return;

  const wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];
  const isInWishlist = wishlist.includes(book._id);
  
  // Calculate discount percentage
  let discountHTML = '';
  let originalPriceHTML = '';
  if (book.originalPrice && book.originalPrice > book.price) {
    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
    originalPriceHTML = `<span class="book-details-original-price">₹${book.originalPrice}</span>`;
    discountHTML = `<span class="book-details-discount">${discount}% OFF</span>`;
  }

  // Stock status
  const stockText = book.stock > 0 ? `In Stock (${book.stock} available)` : 'Out of Stock';
  const stockColor = book.stock > 0 ? '#27ae60' : 'var(--burgundy)';
  const disableButton = book.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

  // Mock Reviews data
  const mockReviews = [
    { name: 'Aarav S.', rating: 5, date: 'June 10, 2024', comment: 'An absolute masterpiece! The character development was phenomenal and the ending left me speechless.' },
    { name: 'Priya M.', rating: 4, date: 'May 28, 2024', comment: 'Beautifully written with rich descriptions. A bit slow in the middle, but the climax made it completely worth it.' },
    { name: 'Rohan D.', rating: 5, date: 'April 14, 2024', comment: 'I couldn\'t put it down. Elena Hart has a way with words that paints vivid worlds in your head.' }
  ];

  bookDetailsGrid.innerHTML = `
    <!-- Image Side -->
    <div class="book-details-image animate-scale-up">
      <img src="${book.coverImage}" alt="${book.title}">
    </div>

    <!-- Info Side -->
    <div class="book-details-info animate-fade-in-up">
      <span class="book-category" style="font-size: 0.9rem; text-transform: uppercase; font-weight: 600; color: var(--gold); letter-spacing: 1px;">${book.category}</span>
      <h1 class="book-details-title">${book.title}</h1>
      <p class="book-details-author">by ${book.author}</p>
      
      <div class="book-details-rating-box">
        <div class="book-details-rating-stars">
          ${renderStars(book.rating)}
        </div>
        <span class="book-details-reviews-count">${book.rating} / 5.0 (${book.reviewsCount || 0} reviews)</span>
      </div>

      <div class="book-details-price-box">
        <span class="book-details-price">₹${book.price}</span>
        ${originalPriceHTML}
        ${discountHTML}
      </div>

      <p style="font-weight: 600; color: ${stockColor}; margin-bottom: 1.5rem; font-size: 0.95rem;">${stockText}</p>
      
      <p class="book-details-desc">${book.description}</p>

      <div class="book-details-actions">
        <div class="qty-selector">
          <button class="qty-btn" onclick="adjustDetailsQty(-1)">-</button>
          <input type="number" id="detailsQty" class="qty-input" value="1" min="1" max="${book.stock || 1}">
          <button class="qty-btn" onclick="adjustDetailsQty(1)">+</button>
        </div>
        
        <button class="btn btn-primary hover-lift" onclick="detailsAddToCart()" ${disableButton}>ADD TO CART</button>
        <button class="btn btn-secondary hover-lift" onclick="detailsBuyNow()" ${disableButton}>BUY NOW</button>
        
        <button class="book-action-btn ${isInWishlist ? 'active' : ''} hover-scale" id="detailsWishlistBtn" style="border: 1px solid var(--paper-dark); padding: 12px; border-radius: 4px;" onclick="detailsToggleWishlist()" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="22" height="22">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- Tabs Component -->
      <div class="book-details-tabs">
        <div class="tabs-header">
          <button class="tab-btn active" onclick="switchDetailsTab(event, 'tabDescription')">Description</button>
          <button class="tab-btn" onclick="switchDetailsTab(event, 'tabSpecs')">Specifications</button>
          <button class="tab-btn" onclick="switchDetailsTab(event, 'tabReviews')">Reviews (${book.reviewsCount || 0})</button>
        </div>

        <div class="tab-content-panel active" id="tabDescription">
          <p>${book.description}</p>
        </div>

        <div class="tab-content-panel" id="tabSpecs">
          <table class="specs-table">
            <tr>
              <td>Publisher</td>
              <td>${book.publisher || 'Lumora Publications'}</td>
            </tr>
            <tr>
              <td>Publication Date</td>
              <td>${book.publicationDate || '2024'}</td>
            </tr>
            <tr>
              <td>Language</td>
              <td>${book.language || 'English'}</td>
            </tr>
            <tr>
              <td>Print Length</td>
              <td>${book.pages} pages</td>
            </tr>
            <tr>
              <td>Category</td>
              <td>${book.category}</td>
            </tr>
            <tr>
              <td>Genre</td>
              <td>${book.genre}</td>
            </tr>
          </table>
        </div>

        <div class="tab-content-panel" id="tabReviews">
          <div class="reviews-list" id="reviewsListContainer" style="display: flex; flex-direction: column; gap: 20px;">
            ${mockReviews.map(r => `
              <div style="background-color: var(--white); padding: 1.5rem; border: 1px solid var(--paper-dark); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <strong>${r.name}</strong>
                  <span style="color: var(--muted); font-size: 0.85rem;">${r.date}</span>
                </div>
                <div style="color: var(--gold); display: flex; gap: 2px; margin-bottom: 8px;">
                  ${renderStars(r.rating)}
                </div>
                <p style="font-size: 0.95rem; line-height: 1.6;">${r.comment}</p>
              </div>
            `).join('')}
          </div>

          <!-- Add Review Form -->
          <div style="margin-top: 30px; border-top: 1px solid var(--paper-dark); padding-top: 20px;">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 15px;">Write a Review</h4>
            <form id="detailsReviewForm" onsubmit="handleReviewSubmit(event)">
              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                  <label for="reviewName">Your Name</label>
                  <input type="text" id="reviewName" class="form-control-input" required placeholder="Jane Doe">
                </div>
                <div class="form-group">
                  <label for="reviewRating">Rating</label>
                  <select id="reviewRating" class="form-control-input" style="height: 48px;" required>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom: 15px;">
                <label for="reviewComment">Review</label>
                <textarea id="reviewComment" class="form-control-input" style="min-height: 100px; padding: 12px; resize: vertical;" required placeholder="Share your experience reading this book..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="padding: 10px 20px;">SUBMIT REVIEW</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load related books based on category
async function loadRelatedBooks(category, currentId) {
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error();
    const books = await response.json();

    // Filter books in same category, exclude current book, limit to 4
    const related = books
      .filter(b => b.category === category && b._id !== currentId)
      .slice(0, 4);

    if (related.length > 0 && relatedGrid) {
      relatedGrid.innerHTML = related.map(book => {
        const wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];
        const isInWishlist = wishlist.includes(book._id);
        return `
          <div class="book-card hover-lift" onclick="window.location.href='/book-details.html?id=${book._id}'">
            <div class="book-cover">
              <img src="${book.coverImage}" alt="${book.title}">
            </div>
            <div class="book-info">
              <span class="book-category">${book.category}</span>
              <h3 class="book-title">${book.title}</h3>
              <p class="book-author">${book.author}</p>
              <div class="book-rating" style="display: flex; gap: 2px; color: var(--gold); margin-bottom: 8px;">
                ${renderStars(book.rating)}
              </div>
              <div class="book-meta">
                <span class="book-price">₹${book.price}</span>
                <div class="book-actions">
                  <button class="book-action-btn book-wishlist-btn ${isInWishlist ? 'active' : ''} hover-scale" onclick="event.stopPropagation(); toggleCatalogWishlist('${book._id}')">
                    <svg viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      if (relatedBooksSection) relatedBooksSection.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading related books:', error);
  }
}

// Adjust quantity counter
function adjustDetailsQty(change) {
  const qtyInput = document.getElementById('detailsQty');
  if (!qtyInput || !currentBook) return;

  let val = parseInt(qtyInput.value) + change;
  const max = currentBook.stock || 1;

  if (val < 1) val = 1;
  if (val > max) val = max;

  qtyInput.value = val;
}

// Add to Cart helper with custom quantity
function detailsAddToCart() {
  const qtyInput = document.getElementById('detailsQty');
  if (!qtyInput || !currentBook) return;

  const qty = parseInt(qtyInput.value, 10) || 1;
  if (currentBook.stock !== undefined && qty > currentBook.stock) {
    alert('Not enough stock available');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];

  const existingItem = cart.find(item => item._id === currentBook._id);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({ ...currentBook, quantity: qty });
  }

  localStorage.setItem('lumoraCart', JSON.stringify(cart));

  if (typeof renderCart === 'function') renderCart();
  if (typeof updateCartBadge === 'function') updateCartBadge();

  if (typeof showToast === 'function') {
    showToast(`Added ${qty} copies to cart!`);
  } else {
    alert(`Added ${qty} copies to cart!`);
  }
}

// Buy Now action (Adds to cart and goes directly to checkout)
function detailsBuyNow() {
  const qtyInput = document.getElementById('detailsQty');
  if (!qtyInput || !currentBook) return;

  const qty = parseInt(qtyInput.value);
  const cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];

  const existingItem = cart.find(item => item._id === currentBook._id);
  if (existingItem) {
    existingItem.quantity = qty; // Reset to this amount for speed check out
  } else {
    cart.push({ ...currentBook, quantity: qty });
  }

  localStorage.setItem('lumoraCart', JSON.stringify(cart));
  
  window.location.href = '/checkout.html';
}

// Toggle Wishlist helper
function detailsToggleWishlist() {
  if (!currentBook) return;

  const wishlistBtn = document.getElementById('detailsWishlistBtn');
  const wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];
  const index = wishlist.indexOf(currentBook._id);

  if (index > -1) {
    wishlist.splice(index, 1);
    if (wishlistBtn) wishlistBtn.classList.remove('active');
    const svg = wishlistBtn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'none');
    if (typeof showToast === 'function') showToast('Removed from wishlist');
  } else {
    wishlist.push(currentBook._id);
    if (wishlistBtn) wishlistBtn.classList.add('active');
    const svg = wishlistBtn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'currentColor');
    if (typeof showToast === 'function') showToast('Added to wishlist!');
  }

  localStorage.setItem('lumoraWishlist', JSON.stringify(wishlist));
  
  if (typeof updateWishlistBadge === 'function') updateWishlistBadge();
}

// Switch Details Tabs
function switchDetailsTab(event, tabId) {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-content-panel');

  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Star renderer helper
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    } else {
      stars += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
  }
  return stars;
}

// Handle dynamic mock review submit
function handleReviewSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('reviewName');
  const ratingInput = document.getElementById('reviewRating');
  const commentInput = document.getElementById('reviewComment');
  const reviewsContainer = document.getElementById('reviewsListContainer');

  if (!nameInput || !ratingInput || !commentInput || !reviewsContainer) return;

  const name = nameInput.value.trim();
  const rating = parseInt(ratingInput.value);
  const comment = commentInput.value.trim();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const newReviewHTML = `
    <div class="animate-fade-in-up" style="background-color: var(--white); padding: 1.5rem; border: 1px solid var(--paper-dark); border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong>${name} (Verified Purchase)</strong>
        <span style="color: var(--muted); font-size: 0.85rem;">${date}</span>
      </div>
      <div style="color: var(--gold); display: flex; gap: 2px; margin-bottom: 8px;">
        ${renderStars(rating)}
      </div>
      <p style="font-size: 0.95rem; line-height: 1.6;">${comment}</p>
    </div>
  `;

  // Insert review at beginning of list
  reviewsContainer.insertAdjacentHTML('afterbegin', newReviewHTML);
  
  // Reset form
  document.getElementById('detailsReviewForm').reset();
  
  if (typeof showToast === 'function') {
    showToast('Thank you! Your review has been posted.');
  } else {
    alert('Thank you! Your review has been posted.');
  }
}

// Make functions globally accessible for HTML click bindings
window.adjustDetailsQty = adjustDetailsQty;
window.detailsAddToCart = detailsAddToCart;
window.detailsBuyNow = detailsBuyNow;
window.detailsToggleWishlist = detailsToggleWishlist;
window.switchDetailsTab = switchDetailsTab;
window.handleReviewSubmit = handleReviewSubmit;
