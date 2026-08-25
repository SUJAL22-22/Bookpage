// ============================================
// LUMORA BOOKS - CHECKOUT CLIENT INTERACTIONS
// ============================================

// State Management
let cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];
let subtotal = 0;
let shippingFee = 0;
let total = 0;

// DOM Elements
const summaryItems = document.getElementById('summaryItems');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryShipping = document.getElementById('summaryShipping');
const summaryTotal = document.getElementById('summaryTotal');

// Shipping Form Fields
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const cityInput = document.getElementById('city');
const zipCodeInput = document.getElementById('zipCode');

// Payment Form Fields
const cardNameInput = document.getElementById('cardName');
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCvvInput = document.getElementById('cardCvv');

// Flow Buttons & Panels
const goToPaymentBtn = document.getElementById('goToPaymentBtn');
const backToShippingBtn = document.getElementById('backToShippingBtn');
const shippingSection = document.getElementById('shippingSection');
const paymentSection = document.getElementById('paymentSection');
const checkoutGrid = document.getElementById('checkoutGrid');
const successContainer = document.getElementById('successContainer');
const checkoutForm = document.getElementById('checkoutForm');

// Step Indicators
const step1Indicator = document.getElementById('step1Indicator');
const step2Indicator = document.getElementById('step2Indicator');
const stepLine1 = document.getElementById('stepLine1');

// Success Page Details
const successEmail = document.getElementById('successEmail');
const receiptOrderId = document.getElementById('receiptOrderId');
const receiptDate = document.getElementById('receiptDate');
const receiptItems = document.getElementById('receiptItems');
const receiptTotal = document.getElementById('receiptTotal');

// Initialize Checkout
document.addEventListener('DOMContentLoaded', () => {
  calculateTotals();
  renderSummary();
  initFormFlow();
  initInputFormatters();
  autoFillUserDetails();
});

// Auto-fill logged in user details
function autoFillUserDetails() {
  const token = localStorage.getItem('lumoraToken');
  if (token) {
    fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => {
      if (user) {
        if (user.name && fullNameInput && !fullNameInput.value) {
          fullNameInput.value = user.name;
        }
        if (user.email && emailInput && !emailInput.value) {
          emailInput.value = user.email;
        }
      }
    })
    .catch(() => {});
  }
}

// Calculations
function calculateTotals() {
  if (cart && Array.isArray(cart) && cart.length > 0) {
    subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    // Free shipping above ₹1000, else flat ₹99
    shippingFee = subtotal >= 1000 ? 0 : 99;
    total = subtotal + shippingFee;
  } else {
    subtotal = 0;
    shippingFee = 0;
    total = 0;
  }
}

// Render Summary panel
function renderSummary() {
  if (!summaryItems) return;

  if (cart && Array.isArray(cart) && cart.length > 0) {
    summaryItems.innerHTML = cart.map(item => `
      <div class="summary-item">
        <img src="${item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'}" alt="${item.title || 'Book'}" class="summary-item-img">
        <div class="summary-item-details">
          <h4 class="summary-item-title">${item.title || 'Book Title'}</h4>
          <p class="summary-item-meta">Qty: ${item.quantity || 1}</p>
        </div>
        <div class="summary-item-price">₹${(item.price || 0) * (item.quantity || 1)}</div>
      </div>
    `).join('');
  } else {
    summaryItems.innerHTML = `
      <div style="padding: 1.5rem 0; text-align: center; color: var(--muted); font-size: 0.9rem;">
        <p>No items in cart</p>
        <a href="/books.html" style="color: var(--burgundy); font-weight: 600; text-decoration: underline; margin-top: 6px; display: inline-block;">+ Add Books</a>
      </div>
    `;
  }

  if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal}`;
  if (summaryShipping) summaryShipping.textContent = subtotal === 0 ? '₹0' : (shippingFee === 0 ? 'FREE' : `₹${shippingFee}`);
  if (summaryTotal) summaryTotal.textContent = `₹${total}`;
}

// Form steps navigation & verification flow
function initFormFlow() {
  // Payment option toggles
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      
      const method = opt.dataset.method;
      const cardForm = document.getElementById('cardDetailsForm');
      const upiForm = document.getElementById('upiPaymentForm');
      const codForm = document.getElementById('codPaymentForm');
      
      if (method === 'card') {
        if (cardForm) cardForm.style.display = 'block';
        if (upiForm) upiForm.style.display = 'none';
        if (codForm) codForm.style.display = 'none';
      } else if (method === 'upi') {
        if (cardForm) cardForm.style.display = 'none';
        if (upiForm) upiForm.style.display = 'block';
        if (codForm) codForm.style.display = 'none';
      } else if (method === 'cod') {
        if (cardForm) cardForm.style.display = 'none';
        if (upiForm) upiForm.style.display = 'none';
        if (codForm) codForm.style.display = 'block';
      }
    });
  });

  // Proceed to payment button
  goToPaymentBtn.addEventListener('click', () => {
    if (validateShippingForm()) {
      // Transition indicators
      step1Indicator.classList.remove('active');
      step1Indicator.classList.add('completed');
      stepLine1.classList.add('active');
      step2Indicator.add ? step2Indicator.classList.add('active') : step2Indicator.classList.add('active');

      // Swap views
      shippingSection.classList.remove('active');
      setTimeout(() => {
        paymentSection.classList.add('active');
      }, 200);
    }
  });

  // Back to shipping button
  backToShippingBtn.addEventListener('click', () => {
    // Transition indicators
    step2Indicator.classList.remove('active');
    stepLine1.classList.remove('active');
    step1Indicator.classList.remove('completed');
    step1Indicator.classList.add('active');

    // Swap views
    paymentSection.classList.remove('active');
    setTimeout(() => {
      shippingSection.classList.add('active');
    }, 200);
  });

  // Submit Order form
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    // Place Order button disabled state
    const submitBtn = document.getElementById('placeOrderBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'PLACING ORDER...';

    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Prepare payload
    const orderPayload = {
      items: cart.map(item => ({
        bookId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      shippingAddress: {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
        city: cityInput.value.trim(),
        zipCode: zipCodeInput.value.trim()
      },
      paymentMethod: selectedMethod,
      subtotal,
      shippingFee,
      total
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessScreen(data.order);
      } else {
        alert(data.message || 'An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'PLACE ORDER';
      }
    } catch (error) {
      console.error('Order request error:', error);
      alert('An error occurred connecting to the server. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'PLACE ORDER';
    }
  });
}

// Input Formatters
function initInputFormatters() {
  // Format Card Number (adds space every 4 digits)
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = value.match(/.{1,4}/g);
    e.target.value = formatted ? formatted.join(' ') : '';
  });

  // Format Card Expiry (MM/YY)
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      e.target.value = value;
    }
  });

  // Phone validation (only digits)
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // ZipCode validation (only digits)
  zipCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
}

// Shipping Validation
function validateShippingForm() {
  let isValid = true;

  // Name check
  if (!fullNameInput.value.trim()) {
    showError(fullNameInput, 'Full Name is required');
    isValid = false;
  } else {
    clearError(fullNameInput);
  }

  // Email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim()) {
    showError(emailInput, 'Email Address is required');
    isValid = false;
  } else if (!emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address');
    isValid = false;
  } else {
    clearError(emailInput);
  }

  // Phone check
  if (!phoneInput.value.trim()) {
    showError(phoneInput, 'Phone Number is required');
    isValid = false;
  } else if (phoneInput.value.trim().length < 10) {
    showError(phoneInput, 'Please enter a valid 10-digit phone number');
    isValid = false;
  } else {
    clearError(phoneInput);
  }

  // Address check
  if (!addressInput.value.trim()) {
    showError(addressInput, 'Street Address is required');
    isValid = false;
  } else {
    clearError(addressInput);
  }

  // City check
  if (!cityInput.value.trim()) {
    showError(cityInput, 'City is required');
    isValid = false;
  } else {
    clearError(cityInput);
  }

  // ZipCode check
  if (!zipCodeInput.value.trim()) {
    showError(zipCodeInput, 'Zip Code is required');
    isValid = false;
  } else if (zipCodeInput.value.trim().length < 6) {
    showError(zipCodeInput, 'Please enter a valid 6-digit zip code');
    isValid = false;
  } else {
    clearError(zipCodeInput);
  }

  return isValid;
}

// Payment Validation
function validatePaymentForm() {
  const activeMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  if (activeMethod !== 'card') {
    return true; // Bypass card checks for UPI / COD
  }

  let isValid = true;

  // Cardholder Name
  if (!cardNameInput.value.trim()) {
    showError(cardNameInput, 'Cardholder Name is required');
    isValid = false;
  } else {
    clearError(cardNameInput);
  }

  // Card Number (needs 16 digits, 19 chars formatted)
  const cardNo = cardNumberInput.value.replace(/\s/g, '');
  if (!cardNumberInput.value.trim()) {
    showError(cardNumberInput, 'Card Number is required');
    isValid = false;
  } else if (cardNo.length < 16) {
    showError(cardNumberInput, 'Card Number must be 16 digits');
    isValid = false;
  } else {
    clearError(cardNumberInput);
  }

  // Expiry (MM/YY)
  const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
  if (!cardExpiryInput.value.trim()) {
    showError(cardExpiryInput, 'Expiration Date is required');
    isValid = false;
  } else if (!expiryRegex.test(cardExpiryInput.value.trim())) {
    showError(cardExpiryInput, 'Use MM/YY format');
    isValid = false;
  } else {
    clearError(cardExpiryInput);
  }

  // CVV
  if (!cardCvvInput.value.trim()) {
    showError(cardCvvInput, 'CVV Code is required');
    isValid = false;
  } else if (cardCvvInput.value.trim().length < 3) {
    showError(cardCvvInput, 'CVV must be 3 digits');
    isValid = false;
  } else {
    clearError(cardCvvInput);
  }

  return isValid;
}

// Form Field UI Error Utilities
function showError(input, message) {
  const formGroup = input.parentElement;
  formGroup.classList.add('invalid');
  const errorSpan = formGroup.querySelector('.error-msg');
  if (errorSpan) {
    errorSpan.textContent = message;
  }
}

function clearError(input) {
  const formGroup = input.parentElement;
  formGroup.classList.remove('invalid');
}

// Show Order Success screen and reset cart
function showSuccessScreen(order) {
  // Clear the Cart completely
  localStorage.removeItem('lumoraCart');
  cart = [];
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  // Populate receipt header & email
  if (successEmail) successEmail.textContent = order.shippingAddress.email;
  const receiptOrderIdEl = document.getElementById('receiptOrderId');
  if (receiptOrderIdEl) receiptOrderIdEl.textContent = order.orderId;
  
  const orderDate = new Date(order.createdAt || Date.now());
  const receiptDateEl = document.getElementById('receiptDate');
  if (receiptDateEl) {
    receiptDateEl.textContent = orderDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Payment method badge & label
  const receiptPaymentBadge = document.getElementById('receiptPaymentBadge');
  const receiptPaymentMethod = document.getElementById('receiptPaymentMethod');
  const method = order.paymentMethod || 'card';
  
  if (method === 'cod') {
    if (receiptPaymentBadge) {
      receiptPaymentBadge.textContent = 'COD - PENDING';
      receiptPaymentBadge.style.backgroundColor = '#e67e22';
    }
    if (receiptPaymentMethod) receiptPaymentMethod.textContent = 'Cash on Delivery';
  } else if (method === 'upi') {
    if (receiptPaymentBadge) {
      receiptPaymentBadge.textContent = 'PAID (UPI)';
      receiptPaymentBadge.style.backgroundColor = '#27ae60';
    }
    if (receiptPaymentMethod) receiptPaymentMethod.textContent = 'UPI / Instant QR Payment';
  } else {
    if (receiptPaymentBadge) {
      receiptPaymentBadge.textContent = 'PAID';
      receiptPaymentBadge.style.backgroundColor = '#27ae60';
    }
    if (receiptPaymentMethod) receiptPaymentMethod.textContent = 'Credit / Debit Card';
  }

  // Shipping details
  const nameEl = document.getElementById('receiptCustomerName');
  const addrEl = document.getElementById('receiptShippingAddress');
  const phoneEl = document.getElementById('receiptCustomerPhone');
  
  if (nameEl) nameEl.textContent = order.shippingAddress.fullName || 'Valued Customer';
  if (addrEl) addrEl.textContent = `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.zipCode}`;
  if (phoneEl) phoneEl.textContent = `Phone: +91 ${order.shippingAddress.phone}`;

  // Items list
  const receiptItemsEl = document.getElementById('receiptItems');
  if (receiptItemsEl && order.items) {
    receiptItemsEl.innerHTML = order.items.map(item => `
      <div class="receipt-item">
        <span class="receipt-item-name">${item.title} <span class="receipt-item-qty">x${item.quantity || 1}</span></span>
        <strong style="color: var(--ink);">₹${(item.price || 0) * (item.quantity || 1)}</strong>
      </div>
    `).join('');
  }

  // Totals breakdown
  const subtotalEl = document.getElementById('receiptSubtotal');
  const shippingEl = document.getElementById('receiptShippingFee');
  const totalEl = document.getElementById('receiptTotal');
  
  if (subtotalEl) subtotalEl.textContent = `₹${order.subtotal || order.total || 0}`;
  if (shippingEl) shippingEl.textContent = (order.shippingFee === 0 || (order.subtotal && order.subtotal >= 1000)) ? 'FREE' : `₹${order.shippingFee || 99}`;
  if (totalEl) totalEl.textContent = `₹${order.total || 0}`;

  // Animate transition to success panel & scroll to top
  if (checkoutGrid) {
    checkoutGrid.style.opacity = '0';
    checkoutGrid.style.transform = 'translateY(-20px)';
  }
  
  setTimeout(() => {
    if (checkoutGrid) checkoutGrid.style.display = 'none';
    if (successContainer) successContainer.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 400);
}
