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
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close Mobile Menu on Link Click
  document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Smooth Scroll for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
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
  const token = localStorage.getItem('lumoraToken');
  if (!token) {
    if (typeof showLoginModal === 'function') {
      showLoginModal();
    } else {
      alert('Please sign in to add books to your cart.');
    }
    return false;
  }

  const book = books.find(b => b._id === bookId);
  if (!book) return false;

  const existingItem = cart.find(item => item._id === bookId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartBadge();
  
  // Show brief animation
  cartBtn.style.transform = 'scale(1.2)';
  setTimeout(() => {
    cartBtn.style.transform = '';
  }, 200);
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
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    cartSubtotal.textContent = '₹0';
    cartTotal.textContent = '₹0';
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
  cartSubtotal.textContent = `₹${subtotal}`;
  cartTotal.textContent = `₹${subtotal}`;
}

function updateCartBadge() {
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

// Load Books from API
async function loadBooks() {
  try {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error('Failed to fetch books');
    
    books = await response.json();
    renderBooks();
    renderCategoryBooks(); // Load default category books (All)
  } catch (error) {
    console.error('Error loading books:', error);
    const errorHTML = `
      <div class="error-state">
        <p>Failed to load books. Please try again later.</p>
      </div>
    `;
    booksGrid.innerHTML = errorHTML;
    if (categoryResultsGrid) {
      categoryResultsGrid.innerHTML = errorHTML;
    }
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
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookModal.classList.contains('active')) {
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
