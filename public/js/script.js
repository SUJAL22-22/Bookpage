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
  updateCartBadge();
  updateWishlistBadge();
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
  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
  });

  searchClose.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });

  let searchTimeout;
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

  // Escape key to close search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });
}

function performSearch(query) {
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
  }
}

// Cart
function initCart() {
  cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function closeCart() {
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  renderCart();
}

function addToCart(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return;

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
  wishlistBtn.addEventListener('click', () => {
    // Could implement wishlist drawer similar to cart
    alert('Wishlist feature coming soon!');
  });
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
  } catch (error) {
    console.error('Error loading books:', error);
    booksGrid.innerHTML = `
      <div class="error-state">
        <p>Failed to load books. Please try again later.</p>
      </div>
    `;
  }
}

// Render Books
function renderBooks(filteredBooks = books) {
  if (filteredBooks.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        <p>No books found</p>
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
  
  // Re-attach event listeners for new elements
  document.querySelectorAll('.book-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.bookId);
    });
  });

  document.querySelectorAll('.book-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.bookId);
    });
  });

  document.querySelectorAll('.book-read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openBookModal(btn.dataset.bookId);
    });
  });
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
  const categoryBtns = categoriesList.querySelectorAll('.category-btn');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter books
      const category = btn.dataset.category;
      if (category === 'all') {
        renderBooks(books);
      } else {
        const filtered = books.filter(book => book.category === category);
        renderBooks(filtered);
      }
      
      // Scroll to books section
      const booksSection = document.getElementById('books');
      if (booksSection) {
        booksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

  // Book of the week buttons
  document.querySelectorAll('.book-week-read, .book-week-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookId = btn.dataset.bookId;
      if (btn.classList.contains('book-week-add')) {
        addToCart(bookId);
      } else {
        openBookModal(bookId);
      }
    });
  });
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
          <button class="btn btn-primary" onclick="addToCart('${book._id}'); closeModal();">ADD TO CART</button>
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
  const testimonials = testimonialTrack.querySelectorAll('.testimonial-item');
  
  // Create dots
  testimonials.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToTestimonial(index));
    testimonialDots.appendChild(dot);
  });

  testimonialPrev.addEventListener('click', () => {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    updateTestimonials();
  });

  testimonialNext.addEventListener('click', () => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonials();
  });

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
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  });

  // Back to Top
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

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
  document.querySelector('.hero').style.opacity = '1';
  document.querySelector('.hero').style.transform = 'translateY(0)';
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;
window.openBookModal = openBookModal;
window.closeModal = closeModal;
