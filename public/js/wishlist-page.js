// ============================================
// LUMORA BOOKS - WISHLIST PAGE CONTROLLER
// ============================================

const wishlistPageGrid = document.getElementById('wishlistPageGrid');

document.addEventListener('DOMContentLoaded', () => {
  renderWishlistPage();
});

// Render Wishlist grid list on the page
async function renderWishlistPage() {
  if (!wishlistPageGrid) return;

  const wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];

  if (wishlist.length === 0) {
    displayEmptyWishlist();
    return;
  }

  // Fetch full details of the wishlisted books
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error();
    const allBooks = await response.json();

    const wishlistBooks = allBooks.filter(book => wishlist.includes(book._id));

    if (wishlistBooks.length === 0) {
      displayEmptyWishlist();
      return;
    }

    wishlistPageGrid.innerHTML = wishlistBooks.map(book => {
      const originalPriceHTML = book.originalPrice ? `<span style="text-decoration: line-through; color: var(--muted); font-size: 0.9rem; margin-left: 8px;">₹${book.originalPrice}</span>` : '';
      const outOfStockHTML = book.stock === 0 ? `<span style="color: var(--burgundy); font-weight: 600; font-size: 0.85rem; display: block; margin-top: 5px;">OUT OF STOCK</span>` : '';

      return `
        <div class="book-card animate-fade-in-up hover-lift" data-book-id="${book._id}" onclick="window.location.href='/book-details.html?id=${book._id}'">
          <div class="book-cover">
            <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
          </div>
          <div class="book-info">
            <span class="book-category">${book.category}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <div class="book-rating" style="display: flex; gap: 2px; color: var(--gold); margin-bottom: 8px;">
              ${renderStars(book.rating)}
            </div>
            <div class="book-meta">
              <div>
                <span class="book-price">₹${book.price}</span>
                ${originalPriceHTML}
                ${outOfStockHTML}
              </div>
              <div class="book-actions">
                <button class="book-action-btn active hover-scale" aria-label="Remove from wishlist" onclick="event.stopPropagation(); removePageWishlistItem('${book._id}')">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                <button class="book-action-btn book-add-cart hover-scale" aria-label="Add to cart" onclick="event.stopPropagation(); handleWishlistAddToCart('${book._id}')" ${book.stock === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn btn-secondary hover-lift" style="width: 100%; margin-top: 1rem;" onclick="event.stopPropagation(); openBookModal('${book._id}')">QUICK VIEW</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error fetching wishlist books:', error);
    wishlistPageGrid.innerHTML = '<p>Error loading wishlist books. Please try again later.</p>';
  }
}

// Display clean empty wishlist state
function displayEmptyWishlist() {
  if (wishlistPageGrid) {
    wishlistPageGrid.innerHTML = `
      <div class="cart-empty-state animate-scale-up" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px; color: var(--muted);">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h3>Your reading wishlist is empty</h3>
        <p style="color: var(--muted); margin-bottom: 2rem;">Save books you want to read later, and they will appear here.</p>
        <a href="/books.html" class="btn btn-primary">EXPLORE BOOKS</a>
      </div>
    `;
  }
}

// Remove item from wishlist page
function removePageWishlistItem(bookId) {
  if (typeof toggleWishlist === 'function') {
    toggleWishlist(bookId);
    renderWishlistPage(); // Re-render wishlist
  }
}

// Add to cart from wishlist page
function handleWishlistAddToCart(bookId) {
  if (typeof addToCart === 'function') {
    if (addToCart(bookId)) {
      showToast('Added to cart!');
    }
  }
}

// Render stars
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    } else {
      stars += `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
  }
  return stars;
}

window.removePageWishlistItem = removePageWishlistItem;
window.handleWishlistAddToCart = handleWishlistAddToCart;
window.renderWishlistPage = renderWishlistPage;
