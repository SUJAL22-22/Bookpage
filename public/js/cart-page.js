// ============================================
// LUMORA BOOKS - CART PAGE CONTROLLER
// ============================================

// DOM Elements
const cartPageGrid = document.getElementById('cartPageGrid');
const cartPageItemsList = document.getElementById('cartPageItemsList');
const cartPageSubtotal = document.getElementById('cartPageSubtotal');
const cartPageShipping = document.getElementById('cartPageShipping');
const cartPageTotal = document.getElementById('cartPageTotal');
const cartPageCheckoutBtn = document.getElementById('cartPageCheckoutBtn');

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  if (cartPageCheckoutBtn) {
    cartPageCheckoutBtn.addEventListener('click', () => {
      const cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];
      if (cart.length > 0) {
        window.location.href = '/checkout.html';
      } else {
        alert('Your shopping cart is empty!');
      }
    });
  }
});

// Render Cart items list on the page
function renderCartPage() {
  const cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];

  if (cart.length === 0) {
    if (cartPageGrid) {
      cartPageGrid.innerHTML = `
        <div class="cart-empty-state animate-scale-up">
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px; color: var(--muted);">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3>Your shopping bag is empty</h3>
          <p style="color: var(--muted); margin-bottom: 2rem;">Explore stories, ideas and unforgettable characters curated for curious minds.</p>
          <a href="/books.html" class="btn btn-primary">EXPLORE BOOKS</a>
        </div>
      `;
    }
    return;
  }

  if (cartPageItemsList) {
    cartPageItemsList.innerHTML = cart.map(item => `
      <div class="cart-item-row animate-fade-in-up">
        <div class="cart-item-img-col">
          <img src="${item.coverImage}" alt="${item.title}" class="cart-item-img">
        </div>
        <div class="cart-item-info-col">
          <h4 class="cart-item-title-text">${item.title}</h4>
          <p class="cart-item-author-text">by ${item.author}</p>
          <p style="color: var(--muted); font-size: 0.85rem; margin-top: 4px;">Category: ${item.category}</p>
        </div>
        <div class="cart-item-price-col">
          ₹${item.price}
        </div>
        <div class="cart-item-qty-col">
          <div class="qty-selector" style="height: 38px;">
            <button class="qty-btn" onclick="adjustPageCartQty('${item._id}', -1)" style="width: 30px;">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly style="width: 35px; font-size: 0.9rem;">
            <button class="qty-btn" onclick="adjustPageCartQty('${item._id}', 1)" style="width: 30px;">+</button>
          </div>
        </div>
        <div class="cart-item-price-col" style="font-weight: 600;">
          ₹${item.price * item.quantity}
        </div>
        <div class="cart-item-remove-col">
          <button class="cart-item-remove-btn" onclick="removePageCartItem('${item._id}')" aria-label="Remove item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Calculate pricing subtotals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 999 ? 0 : 50;
  const total = subtotal + shippingFee;

  if (cartPageSubtotal) cartPageSubtotal.textContent = `₹${subtotal}`;
  if (cartPageShipping) cartPageShipping.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
  if (cartPageTotal) cartPageTotal.textContent = `₹${total}`;
}

// Increment / Decrement page cart quantity
function adjustPageCartQty(bookId, change) {
  if (typeof updateQuantity === 'function') {
    updateQuantity(bookId, change);
    renderCartPage(); // Re-render page
  }
}

// Remove item on page cart
function removePageCartItem(bookId) {
  if (typeof removeFromCart === 'function') {
    removeFromCart(bookId);
    renderCartPage(); // Re-render page
  }
}

window.adjustPageCartQty = adjustPageCartQty;
window.removePageCartItem = removePageCartItem;
window.renderCartPage = renderCartPage;
