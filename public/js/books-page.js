// ============================================
// LUMORA BOOKS - BOOKS CATALOG CONTROLLER
// ============================================

let allBooks = [];
let filteredBooks = [];

// DOM Elements specific to Catalog
const catalogGrid = document.getElementById('catalogGrid');
const resultsCount = document.getElementById('resultsCount');
const sortSelect = document.getElementById('sortSelect');
const priceRangeSlider = document.getElementById('priceRangeSlider');
const priceSliderVal = document.getElementById('priceSliderVal');
const stockToggle = document.getElementById('stockToggle');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const ratingRadios = document.getElementsByName('ratingFilter');

// Mobile filter drawers
const mobileFiltersTrigger = document.getElementById('mobileFiltersTrigger');
const filtersSidebar = document.getElementById('filtersSidebar');
const filtersCloseBtn = document.getElementById('filtersCloseBtn');

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalogBooks();
  initCatalogFilters();
  parseURLParams();
  applyFilters();
});

// Fetch all books
async function fetchCatalogBooks() {
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error('Failed to fetch catalog books');
    allBooks = await response.json();
    filteredBooks = [...allBooks];
  } catch (error) {
    console.error('Error fetching catalog:', error);
    if (catalogGrid) {
      catalogGrid.innerHTML = `
        <div class="no-results-state">
          <h3>Failed to load books</h3>
          <p>Please check your connection and try again.</p>
        </div>
      `;
    }
  }
}

// Setup Event Listeners
function initCatalogFilters() {
  if (priceRangeSlider) {
    priceRangeSlider.addEventListener('input', (e) => {
      if (priceSliderVal) priceSliderVal.textContent = `Max: ₹${e.target.value}`;
      applyFilters();
    });
  }

  if (stockToggle) {
    stockToggle.addEventListener('change', applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  ratingRadios.forEach(radio => {
    radio.addEventListener('change', applyFilters);
  });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetAllFilters);
  }

  // Mobile filters drawer triggers
  if (mobileFiltersTrigger && filtersSidebar) {
    mobileFiltersTrigger.addEventListener('click', () => {
      filtersSidebar.classList.add('active');
    });
  }

  if (filtersCloseBtn && filtersSidebar) {
    filtersCloseBtn.addEventListener('click', () => {
      filtersSidebar.classList.remove('active');
    });
  }
}

// Parse Category URL query parameters (e.g. books.html?category=Fiction)
function parseURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    categoryCheckboxes.forEach(checkbox => {
      if (checkbox.value.toLowerCase() === categoryParam.toLowerCase()) {
        checkbox.checked = true;
      }
    });
  }
}

// Filter and Sort Engine
function applyFilters() {
  let tempBooks = [...allBooks];

  // 1. Filter by Search input (from navigation overlay if filled, or standard query)
  const searchQuery = new URLSearchParams(window.location.search).get('search');
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    tempBooks = tempBooks.filter(book => 
      book.title.toLowerCase().includes(q) || 
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q)
    );
  }

  // 2. Filter by Category Checkboxes
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());

  if (selectedCategories.length > 0) {
    tempBooks = tempBooks.filter(book => 
      selectedCategories.includes(book.category.toLowerCase())
    );
  }

  // 3. Filter by Price Range Slider
  if (priceRangeSlider) {
    const maxPrice = parseFloat(priceRangeSlider.value);
    tempBooks = tempBooks.filter(book => book.price <= maxPrice);
  }

  // 4. Filter by Rating
  let minRating = 'all';
  ratingRadios.forEach(radio => {
    if (radio.checked) minRating = radio.value;
  });

  if (minRating !== 'all') {
    const ratingValue = parseFloat(minRating);
    tempBooks = tempBooks.filter(book => book.rating >= ratingValue);
  }

  // 5. Filter by Availability (Stock status)
  if (stockToggle && stockToggle.checked) {
    tempBooks = tempBooks.filter(book => book.stock > 0);
  }

  // 6. Sorting Logic
  if (sortSelect) {
    const sortVal = sortSelect.value;
    if (sortVal === 'price-low') {
      tempBooks.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-high') {
      tempBooks.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'rating') {
      tempBooks.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === 'popularity') {
      tempBooks.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else {
      // default: newest year first
      tempBooks.sort((a, b) => b.publicationYear - a.publicationYear);
    }
  }

  filteredBooks = tempBooks;
  renderCatalog();
}

// Render filtered books in catalog grid
function renderCatalog() {
  if (!catalogGrid) return;

  if (resultsCount) {
    resultsCount.textContent = `Showing ${filteredBooks.length} of ${allBooks.length} books`;
  }

  if (filteredBooks.length === 0) {
    catalogGrid.innerHTML = `
      <div class="no-results-state" style="grid-column: 1 / -1;">
        <h3>No books match your criteria</h3>
        <p>Try resetting the filters or modifying your search.</p>
        <button class="btn btn-primary" onclick="resetAllFilters()">RESET ALL FILTERS</button>
      </div>
    `;
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];
  
  catalogGrid.innerHTML = filteredBooks.map(book => {
    const isInWishlist = wishlist.includes(book._id);
    const originalPriceHTML = book.originalPrice ? `<span style="text-decoration: line-through; color: var(--muted); font-size: 0.9rem; margin-left: 8px;">₹${book.originalPrice}</span>` : '';
    const outOfStockHTML = book.stock === 0 ? `<span style="color: var(--burgundy); font-weight: 600; font-size: 0.85rem; display: block; margin-top: 5px;">OUT OF STOCK</span>` : '';
    
    return `
      <div class="book-card animate-fade-in-up hover-lift" data-book-id="${book._id}" onclick="navigateToDetails('${book._id}')">
        <div class="book-cover">
          <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
        </div>
        <div class="book-info">
          <span class="book-category">${book.category}</span>
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">${book.author}</p>
          <div class="book-rating" style="display: flex; gap: 2px; color: var(--gold); margin-bottom: 8px;">
            ${renderRatingStars(book.rating)}
            <span style="color: var(--muted); font-size: 0.8rem; margin-left: 4px;">(${book.reviewsCount || 0})</span>
          </div>
          <div class="book-meta">
            <div>
              <span class="book-price">₹${book.price}</span>
              ${originalPriceHTML}
              ${outOfStockHTML}
            </div>
            <div class="book-actions">
              <button class="book-action-btn book-wishlist-btn ${isInWishlist ? 'active' : ''} hover-scale" data-book-id="${book._id}" aria-label="Add to wishlist" onclick="event.stopPropagation(); toggleCatalogWishlist('${book._id}')">
                <svg viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button class="book-action-btn book-add-cart hover-scale" data-book-id="${book._id}" aria-label="Add to cart" onclick="event.stopPropagation(); handleCatalogAddToCart('${book._id}')" ${book.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          </div>
          <button class="btn btn-secondary hover-lift" data-book-id="${book._id}" style="width: 100%; margin-top: 1rem;" onclick="event.stopPropagation(); openBookModal('${book._id}')">QUICK VIEW</button>
        </div>
      </div>
    `;
  }).join('');
}

// Render stars
function renderRatingStars(rating) {
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

// Wishlist handling within catalog page
function toggleCatalogWishlist(bookId) {
  if (typeof toggleWishlist === 'function') {
    toggleWishlist(bookId);
    renderCatalog();
  }
}

// Add to Cart handling within catalog page
function handleCatalogAddToCart(bookId) {
  if (typeof addToCart === 'function') {
    if (addToCart(bookId)) {
      showToast('Added to cart!');
    }
  }
}

// Redirect card clicks to dedicated page
function navigateToDetails(bookId) {
  window.location.href = `/book-details.html?id=${bookId}`;
}

// Reset filters action
function resetAllFilters() {
  categoryCheckboxes.forEach(cb => cb.checked = false);
  
  if (priceRangeSlider) {
    priceRangeSlider.value = 1500;
    if (priceSliderVal) priceSliderVal.textContent = 'Max: ₹1500';
  }

  ratingRadios.forEach(radio => {
    if (radio.value === 'all') radio.checked = true;
  });

  if (stockToggle) stockToggle.checked = false;

  // Clear query params
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  applyFilters();
}

window.resetAllFilters = resetAllFilters;
