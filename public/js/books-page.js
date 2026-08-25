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

const CATALOG_FALLBACK_BOOKS = [
  { _id: 'static1', title: 'Love in the Mist', author: 'Sophie Dubois', description: 'Set in Paris in the 1920s, a painter and a writer cross paths, igniting a passionate love affair.', price: 499, originalPrice: 699, category: 'Romance', genre: 'Historical Romance', coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&h=750&fit=crop', rating: 4.3, reviewsCount: 71, pages: 290, language: 'English', publisher: 'Rive Gauche Books', publicationDate: 'February 14, 2024', publicationYear: 2024, stock: 22, featured: false },
  { _id: 'static2', title: 'Atomic Habits & Mindsets', author: 'Charles Duhigg', description: 'A synthesised blueprint showing how micro-behaviors and habit cues combine to drive personal productivity.', price: 599, originalPrice: 799, category: 'Self Development', genre: 'Habits', coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 450, pages: 260, language: 'English', publisher: 'Catalyst Press', publicationDate: 'July 1, 2024', publicationYear: 2024, stock: 30, featured: true },
  { _id: 'static3', title: "The Silent Patient's Secret", author: 'Alex Michaelides Jr.', description: 'When a therapist takes on a mute patient accused of murdering her husband, he uncovers a deep psychological puzzle.', price: 699, originalPrice: 999, category: 'Mystery', genre: 'Psychological Mystery', coverImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 189, pages: 360, language: 'English', publisher: 'Hesperus Thrillers', publicationDate: 'April 8, 2024', publicationYear: 2024, stock: 15, featured: true },
  { _id: 'static4', title: 'Code and Cosmos', author: 'Alan Turing Jr.', description: 'An accessible exploration of quantum computing, artificial intelligence, and cosmological computing.', price: 899, originalPrice: 1199, category: 'Technology', genre: 'Popular Science', coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 47, pages: 310, language: 'English', publisher: 'Silicon Press', publicationDate: 'March 22, 2024', publicationYear: 2024, stock: 14, featured: false },
  { _id: 'static5', title: 'Architects of the Web', author: 'Lisa Sterling', description: 'Discover the untold story of the pioneers who designed the internet and browser protocols.', price: 799, originalPrice: 999, category: 'Technology', genre: 'Tech History', coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 118, pages: 365, language: 'English', publisher: 'Web Builders Syndicate', publicationDate: 'August 3, 2023', publicationYear: 2023, stock: 8, featured: false },
  { _id: 'static6', title: 'Leonardo da Vinci: A Life', author: 'Walter Isaacson III', description: 'Based on thousands of pages from his notebooks, this stunning biography connects art, science, and curiosity.', price: 999, originalPrice: 1499, category: 'Biography', genre: 'Historical Biography', coverImage: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=500&h=750&fit=crop', rating: 4.9, reviewsCount: 284, pages: 600, language: 'English', publisher: 'Genius Press', publicationDate: 'October 11, 2023', publicationYear: 2023, stock: 5, featured: true },
  { _id: 'static7', title: 'The Roman Way', author: 'Dr. Arthur Miller', description: 'An immersive examination of daily life, philosophy, and strategy during the Roman Empire.', price: 799, originalPrice: 1099, category: 'History', genre: 'Classical History', coverImage: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 130, pages: 380, language: 'English', publisher: 'Romanesque Publications', publicationDate: 'June 5, 2023', publicationYear: 2023, stock: 13, featured: false },
  { _id: 'static8', title: 'Rethinking Capitalism', author: 'Prof. David Harvey', description: 'A provocative critical review of contemporary financial systems and modern economics.', price: 849, originalPrice: 1149, category: 'Business', genre: 'Economics', coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=750&fit=crop', rating: 4.4, reviewsCount: 92, pages: 440, language: 'English', publisher: 'Meridian Books', publicationDate: 'January 17, 2024', publicationYear: 2024, stock: 9, featured: false },
  { _id: 'static9', title: 'The Midnight Library', author: 'Nora Seed', description: 'Between life and death there is a library, and within that library, the shelves go on forever.', price: 549, originalPrice: 799, category: 'Fiction', genre: 'Literary Fiction', coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=750&fit=crop', rating: 4.5, reviewsCount: 312, pages: 304, language: 'English', publisher: 'Canongate Books', publicationDate: 'September 29, 2020', publicationYear: 2020, stock: 20, featured: true },
  { _id: 'static10', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', description: 'An autobiography of one of the greatest scientists and the 11th President of India.', price: 299, originalPrice: 449, category: 'Biography', genre: 'Autobiography', coverImage: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 520, pages: 196, language: 'English', publisher: 'Universities Press', publicationDate: 'October 1, 1999', publicationYear: 1999, stock: 35, featured: false },
  { _id: 'static11', title: 'The Psychology of Money', author: 'Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness.', price: 449, originalPrice: 599, category: 'Business', genre: 'Personal Finance', coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 678, pages: 256, language: 'English', publisher: 'Harriman House', publicationDate: 'September 8, 2020', publicationYear: 2020, stock: 25, featured: true },
  { _id: 'static12', title: 'Dune', author: 'Frank Herbert', description: 'Set in the distant future amidst a feudal interstellar society on desert planet Arrakis.', price: 649, originalPrice: 899, category: 'Fantasy', genre: 'Science Fantasy', coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=750&fit=crop', rating: 4.9, reviewsCount: 890, pages: 412, language: 'English', publisher: 'Chilton Books', publicationDate: 'August 1, 1965', publicationYear: 1965, stock: 18, featured: true },
  { _id: 'static13', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', description: 'What the rich teach their kids about money that the poor and middle class do not.', price: 399, originalPrice: 549, category: 'Business', genre: 'Personal Finance', coverImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 1200, pages: 336, language: 'English', publisher: 'Warner Books', publicationDate: 'April 1, 2000', publicationYear: 2000, stock: 40, featured: false },
  { _id: 'static14', title: 'The Alchemist', author: 'Paulo Coelho', description: "A philosophical novel following a young Andalusian shepherd's journey to Egypt.", price: 349, originalPrice: 499, category: 'Fiction', genre: 'Philosophical Fiction', coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 1500, pages: 208, language: 'English', publisher: 'HarperCollins', publicationDate: 'April 25, 1988', publicationYear: 1988, stock: 30, featured: true },
  { _id: 'static15', title: 'Sapiens', author: 'Yuval Noah Harari', description: 'A brief history of humankind, from the Stone Age to the 21st century.', price: 699, originalPrice: 999, category: 'History', genre: 'Anthropology', coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 890, pages: 512, language: 'English', publisher: 'Harvill Secker', publicationDate: 'September 4, 2011', publicationYear: 2011, stock: 22, featured: false },
];

// Fetch all books
async function fetchCatalogBooks() {
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error('Failed to fetch catalog books');
    allBooks = await response.json();
    if (!allBooks || allBooks.length === 0) throw new Error('Empty catalog response');
    filteredBooks = [...allBooks];
  } catch (error) {
    console.warn('Using fallback catalog data:', error);
    allBooks = [...CATALOG_FALLBACK_BOOKS];
    filteredBooks = [...allBooks];
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
