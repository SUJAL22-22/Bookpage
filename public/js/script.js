// ============================================
// LUMORA BOOKS - JAVASCRIPT INTERACTIONS
// ============================================

// State Management
let books = [];
let cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('lumoraWishlist')) || [];
let currentTestimonial = 0;

// DOM Elements
const navbar = document.querySelector('.navbar');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const wishlistBtn = document.getElementById('wishlistBtn');
const wishlistBadge = document.getElementById('wishlistBadge');
const booksGrid = document.getElementById('booksGrid');
const categoriesList = document.getElementById('categoriesList');
const categoryResultsGrid = document.getElementById('categoryResultsGrid');
const bookModal = document.getElementById('bookModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.querySelector('.scroll-progress');
const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');
const testimonialDots = document.getElementById('testimonialDots');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.getElementById('newsletterMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initCart();
  initWishlist();
  loadBooks();
  initCategories();
  initModal();
  initTestimonials();
  initNewsletter();
  initScrollEffects();
  initSlider();
  initHeroSlider();
  updateCartBadge();
  updateWishlistBadge();

  // Handle empty links
  document.querySelectorAll('.toast-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const text = link.textContent.trim() || link.getAttribute('aria-label');
      showToast(`${text} section is coming soon!`);
    });
  });
});

// Navigation
function initNavigation() {
  // Sticky Navbar
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile Menu Toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Close Mobile Menu on Link Click
  document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Smooth Scroll for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Search
function initSearch() {
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      searchInput.focus();
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
      }
    });
  }

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });

    // Press Enter to go directly to the first matching book details page
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length >= 2) {
          const results = books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.category.toLowerCase().includes(query)
          );
          if (results.length > 0) {
            searchOverlay.classList.remove('active');
            window.location.href = `/book-details.html?id=${results[0]._id}`;
          }
        }
      } else if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
      }
    });
  }
}

function performSearch(query) {
  if (!searchResults) return;

  const results = books.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-empty">
        <p>No books found for "${query}"</p>
      </div>
    `;
  } else {
    searchResults.innerHTML = `
      <p class="search-count">${results.length} books found</p>
      <div class="search-books-grid">
        ${results.map(book => createBookCard(book)).join('')}
      </div>
    `;
    // Attach click listeners to wishlist, cart, and detail redirection callbacks
    attachBookCardListeners(searchResults);
  }
}

// Cart
function initCart() {
  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', () => {
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  const checkoutBtn = document.querySelector('.cart-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        window.location.href = '/checkout.html';
      } else {
        showToast('Your cart is empty!');
      }
    });
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  if (cartDrawer) {
    renderCart();
  }
}

function addToCart(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return false;

  if (book.stock !== undefined && book.stock <= 0) {
    if (typeof showToast === 'function') showToast('Out of stock');
    return false;
  }

  const existingItem = cart.find(item => item._id === bookId);
  if (existingItem) {
    if (book.stock !== undefined && existingItem.quantity >= book.stock) {
      if (typeof showToast === 'function') showToast('No more stock available');
      return false;
    }
    existingItem.quantity++;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartBadge();

  if (cartBtn) {
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cartBtn.style.transform = '';
    }, 200);
  }
  return true;
}

function removeFromCart(bookId) {
  cart = cart.filter(item => item._id !== bookId);
  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQuantity(bookId, change) {
  const item = cart.find(item => item._id === bookId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(bookId);
    return;
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('lumoraCart', JSON.stringify(cart));
}

function renderCart() {
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    if (cartSubtotal) cartSubtotal.textContent = '₹0';
    if (cartTotal) cartTotal.textContent = '₹0';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.coverImage}" alt="${item.title}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <p class="cart-item-author">${item.author}</p>
        <p class="cart-item-price">₹${item.price}</p>
        <div class="cart-item-quantity">
          <button class="cart-quantity-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button class="cart-quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item._id}')">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal}`;
  if (cartTotal) cartTotal.textContent = `₹${subtotal}`;
}

function updateCartBadge() {
  if (!cartBadge) return;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Wishlist
function initWishlist() {
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistClose = document.getElementById('wishlistClose');
  const wishlistOverlay = document.getElementById('wishlistOverlay');
  
  if (!wishlistDrawer) return;

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      wishlistDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderWishlist();
    });
  }

  if (wishlistClose) {
    wishlistClose.addEventListener('click', closeWishlist);
  }
  if (wishlistOverlay) {
    wishlistOverlay.addEventListener('click', closeWishlist);
  }

  function closeWishlist() {
    wishlistDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderWishlist() {
  const wishlistItems = document.getElementById('wishlistItems');
  if (!wishlistItems) return;

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = '<p class="cart-empty">Your wishlist is empty</p>';
    return;
  }

  const wishlistBooks = books.filter(b => wishlist.includes(b._id));
  wishlistItems.innerHTML = wishlistBooks.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.coverImage}" alt="${item.title}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <p class="cart-item-author">${item.author}</p>
        <p class="cart-item-price">₹${item.price}</p>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="if(addToCart('${item._id}')) showToast('Added to cart!');">ADD TO CART</button>
          <button class="cart-item-remove" style="margin: auto 0;" onclick="toggleWishlist('${item._id}'); renderWishlist();">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleWishlist(bookId) {
  const index = wishlist.indexOf(bookId);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(bookId);
  }

  localStorage.setItem('lumoraWishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
  renderBooks();
  
  // Re-render categories grid
  if (categoriesList) {
    const activeBtn = categoriesList.querySelector('.category-btn.active');
    const category = activeBtn ? activeBtn.dataset.category : 'all';
    const filtered = category === 'all' ? books : books.filter(book => book.category === category);
    renderCategoryBooks(filtered);
  }
}

function updateWishlistBadge() {
  wishlistBadge.textContent = wishlist.length;
  wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
}

// Static fallback books data (used when API is unavailable)
const STATIC_BOOKS = [
  { _id: 'static1', title: 'Love in the Mist', author: 'Sophie Dubois', description: 'Set in Paris in the 1920s, a painter and a writer cross paths, igniting a passionate love affair.', price: 499, originalPrice: 699, category: 'Romance', genre: 'Historical Romance', coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&h=750&fit=crop', rating: 4.3, reviewsCount: 71, pages: 290, language: 'English', publisher: 'Rive Gauche Books', publicationDate: 'February 14, 2024', publicationYear: 2024, stock: 22, featured: false },
  { _id: 'static2', title: 'Atomic Habits & Mindsets', author: 'Charles Duhigg', description: 'A synthesised blueprint showing how micro-behaviors and habit cues combine to drive personal productivity.', price: 599, originalPrice: 799, category: 'Self Development', genre: 'Habits', coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 450, pages: 260, language: 'English', publisher: 'Catalyst Press', publicationDate: 'July 1, 2024', publicationYear: 2024, stock: 30, featured: true },
  { _id: 'static3', title: "The Silent Patient's Secret", author: 'Alex Michaelides Jr.', description: 'When a therapist takes on a mute patient accused of murdering her husband, he uncovers a deep psychological puzzle.', price: 699, originalPrice: 999, category: 'Mystery', genre: 'Psychological Mystery', coverImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 189, pages: 360, language: 'English', publisher: 'Hesperus Thrillers', publicationDate: 'April 8, 2024', publicationYear: 2024, stock: 15, featured: true },
  { _id: 'static4', title: 'Code and Cosmos', author: 'Alan Turing Jr.', description: 'An accessible exploration of quantum computing, artificial intelligence, and how computer architectures are reshaping our cosmological understanding.', price: 899, originalPrice: 1199, category: 'Technology', genre: 'Popular Science', coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 47, pages: 310, language: 'English', publisher: 'Silicon Press', publicationDate: 'March 22, 2024', publicationYear: 2024, stock: 14, featured: false },
  { _id: 'static5', title: 'Architects of the Web', author: 'Lisa Sterling', description: 'Discover the untold story of the pioneers who designed the internet and browser protocols.', price: 799, originalPrice: 999, category: 'Technology', genre: 'Tech History', coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 118, pages: 365, language: 'English', publisher: 'Web Builders Syndicate', publicationDate: 'August 3, 2023', publicationYear: 2023, stock: 8, featured: false },
  { _id: 'static6', title: 'Leonardo da Vinci: A Life', author: 'Walter Isaacson III', description: 'Based on thousands of pages from his notebooks, this stunning biography connects art, science, and insatiable curiosity.', price: 999, originalPrice: 1499, category: 'Biography', genre: 'Historical Biography', coverImage: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=500&h=750&fit=crop', rating: 4.9, reviewsCount: 284, pages: 600, language: 'English', publisher: 'Genius Press', publicationDate: 'October 11, 2023', publicationYear: 2023, stock: 5, featured: true },
  { _id: 'static7', title: 'The Roman Way', author: 'Dr. Arthur Miller', description: 'An immersive examination of daily life, political philosophy, and military strategy during the rise of the Roman Empire.', price: 799, originalPrice: 1099, category: 'History', genre: 'Classical History', coverImage: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 130, pages: 380, language: 'English', publisher: 'Romanesque Publications', publicationDate: 'June 5, 2023', publicationYear: 2023, stock: 13, featured: false },
  { _id: 'static8', title: 'Rethinking Capitalism', author: 'Prof. David Harvey', description: 'A provocative critical review of contemporary financial systems and modern economics.', price: 849, originalPrice: 1149, category: 'Business', genre: 'Economics', coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=750&fit=crop', rating: 4.4, reviewsCount: 92, pages: 440, language: 'English', publisher: 'Meridian Books', publicationDate: 'January 17, 2024', publicationYear: 2024, stock: 9, featured: false },
  { _id: 'static9', title: 'The Midnight Library', author: 'Nora Seed', description: 'Between life and death there is a library, and within that library, the shelves go on forever.', price: 549, originalPrice: 799, category: 'Fiction', genre: 'Literary Fiction', coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=750&fit=crop', rating: 4.5, reviewsCount: 312, pages: 304, language: 'English', publisher: 'Canongate Books', publicationDate: 'September 29, 2020', publicationYear: 2020, stock: 20, featured: true },
  { _id: 'static10', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', description: 'An autobiography of one of the greatest scientists and the 11th President of India.', price: 299, originalPrice: 449, category: 'Biography', genre: 'Autobiography', coverImage: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 520, pages: 196, language: 'English', publisher: 'Universities Press', publicationDate: 'October 1, 1999', publicationYear: 1999, stock: 35, featured: false },
  { _id: 'static11', title: 'The Psychology of Money', author: 'Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness with unique stories, observations and surprising truths.', price: 449, originalPrice: 599, category: 'Business', genre: 'Personal Finance', coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 678, pages: 256, language: 'English', publisher: 'Harriman House', publicationDate: 'September 8, 2020', publicationYear: 2020, stock: 25, featured: true },
  { _id: 'static12', title: 'Dune', author: 'Frank Herbert', description: "Set in the distant future amidst a feudal interstellar society, the story follows Paul Atreides, whose family accepts control of the desert planet Arrakis.", price: 649, originalPrice: 899, category: 'Fantasy', genre: 'Science Fantasy', coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=750&fit=crop', rating: 4.9, reviewsCount: 890, pages: 412, language: 'English', publisher: 'Chilton Books', publicationDate: 'August 1, 1965', publicationYear: 1965, stock: 18, featured: true },
  { _id: 'static13', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', description: 'What the rich teach their kids about money that the poor and middle class do not.', price: 399, originalPrice: 549, category: 'Business', genre: 'Personal Finance', coverImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=750&fit=crop', rating: 4.6, reviewsCount: 1200, pages: 336, language: 'English', publisher: 'Warner Books', publicationDate: 'April 1, 2000', publicationYear: 2000, stock: 40, featured: false },
  { _id: 'static14', title: 'The Alchemist', author: 'Paulo Coelho', description: "A philosophical novel following a young Andalusian shepherd's journey to the pyramids of Egypt.", price: 349, originalPrice: 499, category: 'Fiction', genre: 'Philosophical Fiction', coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&h=750&fit=crop', rating: 4.7, reviewsCount: 1500, pages: 208, language: 'English', publisher: 'HarperCollins', publicationDate: 'April 25, 1988', publicationYear: 1988, stock: 30, featured: true },
  { _id: 'static15', title: 'Sapiens', author: 'Yuval Noah Harari', description: 'A brief history of humankind, from the Stone Age to the 21st century.', price: 699, originalPrice: 999, category: 'History', genre: 'Anthropology', coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&h=750&fit=crop', rating: 4.8, reviewsCount: 890, pages: 512, language: 'English', publisher: 'Harvill Secker', publicationDate: 'September 4, 2011', publicationYear: 2011, stock: 22, featured: false },
];

// Load Books from API with static fallback
async function loadBooks() {
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error('Failed to fetch books');
    books = await response.json();
    if (!books || books.length === 0) throw new Error('No books from API');
    renderBooks();
    renderCategoryBooks();
  } catch (error) {
    console.warn('API unavailable, using static books:', error.message);
    books = STATIC_BOOKS;
    renderBooks();
    renderCategoryBooks();
  }
}


// Helper to attach event listeners to book card buttons inside a container
function attachBookCardListeners(container) {
  if (!container) return;
  
  container.querySelectorAll('.book-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.bookId);
    });
  });

  container.querySelectorAll('.book-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (addToCart(btn.dataset.bookId)) {
        showToast('Added to cart!');
      }
    });
  });

  container.querySelectorAll('.book-read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `/book-details.html?id=${btn.dataset.bookId}`;
    });
  });

  container.querySelectorAll('.book-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.location.href = `/book-details.html?id=${card.dataset.bookId}`;
    });
  });
}

// Render Books in the slider
function renderBooks(filteredBooks = books) {
  if (!booksGrid) return;
  if (filteredBooks.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        <p>No books found</p>
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
  attachBookCardListeners(booksGrid);
}

// Render Books in the Category Results Grid
function renderCategoryBooks(filteredBooks = books) {
  if (!categoryResultsGrid) return;
  
  if (filteredBooks.length === 0) {
    categoryResultsGrid.innerHTML = `
      <div class="empty-state">
        <p>No books found in this category</p>
      </div>
    `;
    return;
  }

  categoryResultsGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
  attachBookCardListeners(categoryResultsGrid);
}

function createBookCard(book) {
  const isInWishlist = wishlist.includes(book._id);
  return `
    <div class="book-card animate-fade-in-up hover-lift" data-book-id="${book._id}">
      <div class="book-cover">
        <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
      </div>
      <div class="book-info">
        <span class="book-category">${book.category}</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <div class="book-rating">
          ${renderStars(book.rating)}
        </div>
        <div class="book-meta">
          <span class="book-price">₹${book.price}</span>
          <div class="book-actions">
            <button class="book-action-btn book-wishlist-btn ${isInWishlist ? 'active' : ''} hover-scale" data-book-id="${book._id}" aria-label="Add to wishlist">
              <svg viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button class="book-action-btn book-add-cart hover-scale" data-book-id="${book._id}" aria-label="Add to cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          </div>
        </div>
        <button class="btn btn-secondary book-read-more hover-lift" data-book-id="${book._id}" style="width: 100%; margin-top: 1rem;">READ MORE</button>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  }
  
  if (hasHalfStar) {
    stars += '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  }
  
  return stars;
}

// Categories
function initCategories() {
  if (!categoriesList) return;
  const categoryBtns = categoriesList.querySelectorAll('.category-btn');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter books
      const category = btn.dataset.category;
      const filtered = category === 'all' ? books : books.filter(book => book.category === category);
      renderCategoryBooks(filtered);
    });
  });
}

// Modal
function initModal() {
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookModal && bookModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Book of the week container click redirect
  const bookWeekContent = document.querySelector('.book-week-content');
  if (bookWeekContent) {
    bookWeekContent.style.cursor = 'pointer';
    bookWeekContent.addEventListener('click', (e) => {
      if (e.target.closest('.book-week-add')) return; // handled separately
      
      const silentGardenBook = books.find(b => b.title.toLowerCase().includes("silent garden"));
      if (silentGardenBook) {
        window.location.href = `/book-details.html?id=${silentGardenBook._id}`;
      } else {
        window.location.href = '/books.html';
      }
    });
  }

  // Book of the week explicit actions
  const bookWeekAdd = document.querySelector('.book-week-add');
  if (bookWeekAdd) {
    bookWeekAdd.addEventListener('click', (e) => {
      e.stopPropagation();
      const silentGardenBook = books.find(b => b.title.toLowerCase().includes("silent garden"));
      if (silentGardenBook) {
        if (addToCart(silentGardenBook._id)) {
          showToast('Added to cart!');
        }
      }
    });
  }

  const bookWeekRead = document.querySelector('.book-week-read');
  if (bookWeekRead) {
    bookWeekRead.addEventListener('click', (e) => {
      e.stopPropagation();
      const silentGardenBook = books.find(b => b.title.toLowerCase().includes("silent garden"));
      if (silentGardenBook) {
        window.location.href = `/book-details.html?id=${silentGardenBook._id}`;
      }
    });
  }
}

function openBookModal(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return;

  modalBody.innerHTML = `
    <div class="modal-book-content">
      <div class="modal-book-cover">
        <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
      </div>
      <div class="modal-book-info">
        <h3>${book.title}</h3>
        <p class="modal-book-author">${book.author}</p>
        <p class="modal-book-description">${book.description}</p>
        <div class="modal-book-details">
          <p><strong>Rating:</strong> ${book.rating}/5</p>
          <p><strong>Pages:</strong> ${book.pages}</p>
          <p><strong>Genre:</strong> ${book.genre}</p>
          <p><strong>Published:</strong> ${book.publicationYear}</p>
        </div>
        <p class="modal-book-price">₹${book.price}</p>
        <div class="modal-book-cta">
          <button class="btn btn-primary" onclick="if(addToCart('${book._id}')) { showToast('Added to cart!'); closeModal(); }">ADD TO CART</button>
          <button class="btn btn-secondary" onclick="toggleWishlist('${book._id}')">
            ${wishlist.includes(book._id) ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
          </button>
        </div>
      </div>
    </div>
  `;

  bookModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  bookModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Testimonials
function initTestimonials() {
  if (!testimonialTrack || !testimonialDots) return;
  const testimonials = testimonialTrack.querySelectorAll('.testimonial-item');
  
  // Create dots
  testimonials.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToTestimonial(index));
    testimonialDots.appendChild(dot);
  });

  if (testimonialPrev) {
    testimonialPrev.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      updateTestimonials();
    });
  }

  if (testimonialNext) {
    testimonialNext.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      updateTestimonials();
    });
  }

  // Auto-advance
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonials();
  }, 5000);
}

function goToTestimonial(index) {
  currentTestimonial = index;
  updateTestimonials();
}

function updateTestimonials() {
  const testimonials = testimonialTrack.querySelectorAll('.testimonial-item');
  const dots = testimonialDots.querySelectorAll('.testimonial-dot');
  
  testimonials.forEach((item, index) => {
    // Remove all classes first
    item.classList.remove('active', 'prev');
    
    // Add appropriate classes based on position
    if (index === currentTestimonial) {
      item.classList.add('active');
    } else if (index === (currentTestimonial - 1 + testimonials.length) % testimonials.length) {
      item.classList.add('prev');
    }
  });
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentTestimonial);
  });
}

// Newsletter
function initNewsletter() {
  if (!newsletterForm) return;
  // Main newsletter form
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('.newsletter-input').value;
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        newsletterMessage.textContent = 'Thank you for subscribing!';
        newsletterMessage.className = 'newsletter-message success';
        newsletterForm.reset();
      } else {
        newsletterMessage.textContent = data.message || 'Subscription failed. Please try again.';
        newsletterMessage.className = 'newsletter-message error';
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      newsletterMessage.textContent = 'An error occurred. Please try again.';
      newsletterMessage.className = 'newsletter-message error';
    }
  });

  // Footer newsletter form
  const footerNewsletterForm = document.querySelector('.footer-newsletter-form');
  if (footerNewsletterForm) {
    footerNewsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = footerNewsletterForm.querySelector('.footer-newsletter-input').value;
      
      try {
        const response = await fetch('/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Thank you for subscribing to our newsletter!');
          footerNewsletterForm.reset();
        } else {
          alert(data.message || 'Subscription failed. Please try again.');
        }
      } catch (error) {
        console.error('Footer newsletter subscription error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }
}

// Scroll Effects
function initScrollEffects() {
  // Scroll Progress
  window.addEventListener('scroll', () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  });

  // Back to Top
  window.addEventListener('scroll', () => {
    if (!backToTop) return;
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  // Make hero visible immediately
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;
window.openBookModal = openBookModal;
window.closeModal = closeModal;

// Slider
function initSlider() {
  const booksGrid = document.getElementById('booksGrid');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');

  if (booksGrid && sliderPrev && sliderNext) {
    const scrollAmount = 300; // Amount to scroll per click

    sliderPrev.addEventListener('click', () => {
      booksGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    sliderNext.addEventListener('click', () => {
      booksGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
}

// Toast Notification System
function showToast(message) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast animate-fade-in-up';
  toast.style.cssText = `
    background: var(--color-bg);
    color: var(--color-text);
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    font-family: var(--font-secondary);
    font-weight: 500;
    border-left: 4px solid var(--color-primary);
    transition: opacity 0.3s ease;
  `;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
window.showToast = showToast;

// Hero Slider
function initHeroSlider() {
  const hero = document.getElementById('videoHero');
  const video = document.getElementById('booksBgVideo');
  const slides = document.querySelectorAll('.video-hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('btnPrev');
  const nextBtn = document.getElementById('btnNext');
  const indexNum = document.getElementById('currentSlideNum');
  const progressBar = document.getElementById('progressTimelineActive');
  const controlsContainer = document.getElementById('controlsContainer');
  const statBoxes = document.querySelectorAll('.hero-stat-box');
  const scrollInd = document.getElementById('scrollIndicator');
  const fallbackBooks = document.querySelectorAll('.fallback-book');
  const videoContainer = document.getElementById('videoContainer');
  const lightBlob = document.getElementById('lightBlob');
  
  if (!slides.length) return;
  
  let currentIndex = 0;
  let autoplayInterval;
  const slideDuration = 8000; // 8 seconds per slide
  let startTime = Date.now();
  let progressInterval;

  // Safe Autoplay verification
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {
      // Graceful fallback to poster image
    });
    video.addEventListener('loadeddata', () => {
      video.classList.add('loaded');
    });
  }

  // Stagger entry animations
  setTimeout(() => {
    if (hero) hero.classList.add('loaded');
    if (controlsContainer) controlsContainer.classList.add('visible');
    if (scrollInd) scrollInd.classList.add('visible');
    statBoxes.forEach(box => box.classList.add('visible'));
    animateHeroStats();
  }, 300);

  function changeSlide(index) {
    let nextIndex = index;
    if (nextIndex >= slides.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = slides.length - 1;

    // Transition slides
    slides[currentIndex].classList.remove('active');
    if (dots.length > currentIndex) dots[currentIndex].classList.remove('active');

    currentIndex = nextIndex;
    slides[currentIndex].classList.add('active');
    if (dots.length > currentIndex) dots[currentIndex].classList.add('active');

    // Update global container slide index
    if (hero) hero.setAttribute('data-active-slide', currentIndex);

    // Update controls tracker text
    if (indexNum) {
      indexNum.textContent = `0${currentIndex + 1}`;
    }

    resetTimeline();
  }

  function startAutoplay() {
    startTime = Date.now();
    clearInterval(progressInterval);
    autoplayInterval = setTimeout(() => {
      changeSlide(currentIndex + 1);
    }, slideDuration);

    const updateRate = 1000 / 60;
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / slideDuration) * 100, 100);
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }
    }, updateRate);
  }

  function resetTimeline() {
    clearTimeout(autoplayInterval);
    clearInterval(progressInterval);
    if (progressBar) progressBar.style.width = '0%';
    startAutoplay();
  }

  // Bind controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => changeSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changeSlide(currentIndex + 1));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      changeSlide(index);
    });
  });

  // Keyboard navigation support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      changeSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      changeSlide(currentIndex + 1);
    }
  });

  // Touch swiping support
  if (hero) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    hero.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    hero.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const threshold = 50;
      if (touchStartX - touchEndX > threshold) {
        changeSlide(currentIndex + 1);
      } else if (touchEndX - touchStartX > threshold) {
        changeSlide(currentIndex - 1);
      }
    }, { passive: true });
  }

  // Start Autoplay Loop
  startAutoplay();

  // Mouse Parallax for desktop
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const isMobile = window.matchMedia("(max-width: 992px)");

  if (!isMobile.matches) {
    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function parallaxLoop() {
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (videoContainer) {
        const shiftX = mouseX * -20;
        const shiftY = mouseY * -20;
        videoContainer.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
      }

      if (lightBlob) {
        const blobX = mouseX * 50;
        const blobY = mouseY * 50;
        lightBlob.style.transform = `translate3d(${blobX}px, ${blobY}px, 0)`;
      }

      fallbackBooks.forEach(book => {
        const depth = parseFloat(book.getAttribute('data-depth')) || 0.5;
        const bookX = mouseX * depth * 35;
        const bookY = mouseY * depth * 35;
        book.style.marginLeft = `${bookX}px`;
        book.style.marginTop = `${bookY}px`;
      });

      requestAnimationFrame(parallaxLoop);
    }
    requestAnimationFrame(parallaxLoop);
  }

  // Drift animations for background fallback books
  let floatTime = 0;
  function animateDriftingBooks() {
    floatTime += 0.008;
    fallbackBooks.forEach((book, idx) => {
      const depth = parseFloat(book.getAttribute('data-depth')) || 0.5;
      const indexOffset = idx * 1.5;
      const yDrift = Math.sin(floatTime + indexOffset) * 15 * depth;
      const xDrift = Math.cos((floatTime * 0.7) + indexOffset) * 10 * depth;
      const zRotate = Math.sin((floatTime * 0.5) + indexOffset) * 5 * depth;

      book.style.transform = `translate3d(${xDrift}px, ${yDrift}px, 0) rotateY(-15deg) rotateZ(${zRotate}deg)`;
    });

    requestAnimationFrame(animateDriftingBooks);
  }
  requestAnimationFrame(animateDriftingBooks);

  // Statistics numbers animation helper
  function animateHeroStats() {
    const numbers = document.querySelectorAll('.hero-stat-number');
    numbers.forEach(elem => {
      const target = parseFloat(elem.getAttribute('data-val'));
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        current += increment;
        if (frame >= steps) {
          clearInterval(timer);
          elem.textContent = isDecimal ? target.toFixed(1) + '/5' : target.toLocaleString() + '+';
        } else {
          elem.textContent = isDecimal ? current.toFixed(1) + '/5' : Math.floor(current).toLocaleString() + '+';
        }
      }, duration / steps);
    });
  }
}
