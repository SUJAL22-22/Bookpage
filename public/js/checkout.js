// ============================================
// LUMORA BOOKS - CHECKOUT (complete clickable flow)
// ============================================

try {
  cart = JSON.parse(localStorage.getItem('lumoraCart')) || [];
} catch (e) {
  cart = [];
}

let subtotal = 0;
let shippingFee = 50;
let total = 0;

document.addEventListener('DOMContentLoaded', () => {
  cart = safeCart();
  if (!cart.length) {
    window.location.href = '/cart.html';
    return;
  }

  calculateTotals();
  renderSummary();
  updateCompactSummary();
  updateCodAmount();
  wireButtons();
  wirePaymentOptions();
  wireShippingOptions();
  wireFormatters();
  wirePlaceOrder();
  autoFillUserDetails();
  showStep('address');
});

function safeCart() {
  try {
    const c = JSON.parse(localStorage.getItem('lumoraCart')) || [];
    return Array.isArray(c) ? c.filter((i) => i && i._id && i.quantity > 0) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('lumoraCart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function calculateTotals() {
  subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const selected = document.querySelector('input[name="shippingOption"]:checked');
  const option = selected ? selected.value : 'standard';
  if (option === 'express') {
    shippingFee = 150;
  } else {
    shippingFee = subtotal >= 999 ? 0 : 50;
  }
  total = subtotal + shippingFee;
}

function updateCompactSummary() {
  const el = (id) => document.getElementById(id);
  if (el('compactSubtotal')) el('compactSubtotal').textContent = `₹${subtotal}`;
  if (el('compactShipping')) el('compactShipping').textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
  if (el('compactTotal')) el('compactTotal').textContent = `₹${total}`;
  if (el('summarySubtotal')) el('summarySubtotal').textContent = `₹${subtotal}`;
  if (el('summaryShipping')) el('summaryShipping').textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
  if (el('summaryTotal')) el('summaryTotal').textContent = `₹${total}`;
}

function updateCodAmount() {
  const note = document.getElementById('codAmountNote');
  if (note) note.textContent = `You will pay ₹${total} when your order is delivered.`;
}

function renderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  if (!summaryItems) return;

  if (!cart.length) {
    summaryItems.innerHTML = `
      <div style="padding:1.5rem 0;text-align:center;color:var(--muted);">
        <p>No items in cart</p>
        <a href="/cart.html" style="color:var(--burgundy);font-weight:600;">Go to Cart</a>
      </div>`;
    return;
  }

  summaryItems.innerHTML = cart.map((item, idx) => `
    <div class="summary-item">
      <img src="${item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'}" alt="${escapeHtml(item.title || 'Book')}" class="summary-item-img">
      <div class="summary-item-details">
        <h4 class="summary-item-title">${escapeHtml(item.title || 'Book')}</h4>
        <div class="summary-item-meta">
          <span>Qty:</span>
          <div class="summary-qty-controls">
            <button type="button" class="summary-qty-btn" data-qty-idx="${idx}" data-qty-delta="-1" title="Decrease">−</button>
            <span>${item.quantity || 1}</span>
            <button type="button" class="summary-qty-btn" data-qty-idx="${idx}" data-qty-delta="1" title="Increase">+</button>
          </div>
        </div>
      </div>
      <div class="summary-item-price">₹${(Number(item.price) || 0) * (Number(item.quantity) || 1)}</div>
    </div>
  `).join('') + `
    <a href="/books.html" class="summary-add-more">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add More Books
    </a>`;

  summaryItems.querySelectorAll('.summary-qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateSummaryQty(Number(btn.dataset.qtyIdx), Number(btn.dataset.qtyDelta));
    });
  });

  updateCompactSummary();
  updateCodAmount();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.updateSummaryQty = function (index, delta) {
  if (!cart[index]) return;
  cart[index].quantity = (Number(cart[index].quantity) || 1) + delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  if (!cart.length) {
    window.location.href = '/cart.html';
    return;
  }
  calculateTotals();
  renderSummary();
};

function showStep(step) {
  const addressSection = document.getElementById('addressSection');
  const paymentSection = document.getElementById('paymentSection');
  const shippingSection = document.getElementById('shippingSection');
  const s1 = document.getElementById('step1Indicator');
  const s2 = document.getElementById('step2Indicator');
  const s3 = document.getElementById('step3Indicator');
  const l1 = document.getElementById('stepLine1');
  const l2 = document.getElementById('stepLine2');

  [addressSection, paymentSection, shippingSection].forEach((el) => el && el.classList.remove('active'));
  [s1, s2, s3].forEach((el) => {
    if (!el) return;
    el.classList.remove('active', 'completed');
  });
  if (l1) l1.classList.remove('active');
  if (l2) l2.classList.remove('active');

  if (step === 'address') {
    if (addressSection) addressSection.classList.add('active');
    if (s1) s1.classList.add('active');
  } else if (step === 'payment') {
    if (paymentSection) paymentSection.classList.add('active');
    if (s1) s1.classList.add('completed');
    if (l1) l1.classList.add('active');
    if (s2) s2.classList.add('active');
  } else if (step === 'shipping') {
    if (shippingSection) shippingSection.classList.add('active');
    if (s1) s1.classList.add('completed');
    if (s2) s2.classList.add('completed');
    if (l1) l1.classList.add('active');
    if (l2) l2.classList.add('active');
    if (s3) s3.classList.add('active');
    calculateTotals();
    updateCompactSummary();
    updateCodAmount();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.handleGoToPayment = function (event) {
  if (event) event.preventDefault();
  if (!validateAddressForm()) return;
  showStep('payment');
};

window.handleBackToAddress = function (event) {
  if (event) event.preventDefault();
  showStep('address');
};

window.handleGoToShipping = function (event) {
  if (event) event.preventDefault();
  if (!validatePaymentForm()) return;
  showStep('shipping');
};

window.handleBackToPayment = function (event) {
  if (event) event.preventDefault();
  showStep('payment');
};

window.selectPaymentMethod = function (method) {
  const radio = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
  if (radio) radio.checked = true;

  document.querySelectorAll('.payment-option').forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.method === method);
  });

  const cardForm = document.getElementById('cardDetailsForm');
  const upiForm = document.getElementById('upiPaymentForm');
  const codForm = document.getElementById('codPaymentForm');
  if (cardForm) cardForm.style.display = method === 'card' ? 'block' : 'none';
  if (upiForm) upiForm.style.display = method === 'upi' ? 'block' : 'none';
  if (codForm) codForm.style.display = method === 'cod' ? 'block' : 'none';
  updateCodAmount();
};

window.selectShipping = function (option) {
  const radio = document.querySelector(`input[name="shippingOption"][value="${option}"]`);
  if (radio) radio.checked = true;
  document.querySelectorAll('.shipping-option').forEach((opt) => opt.classList.remove('selected'));
  const el = document.getElementById(option === 'express' ? 'expressOption' : 'standardOption');
  if (el) el.classList.add('selected');
  calculateTotals();
  updateCompactSummary();
  updateCodAmount();
};

function wireButtons() {
  const map = [
    ['goToPaymentBtn', handleGoToPayment],
    ['backToAddressBtn', handleBackToAddress],
    ['goToShippingBtn', handleGoToShipping],
    ['backToPaymentBtn', handleBackToPayment]
  ];
  map.forEach(([id, fn]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = (e) => fn(e);
    }
  });
}

function wirePaymentOptions() {
  document.querySelectorAll('.payment-option').forEach((opt) => {
    opt.addEventListener('click', () => selectPaymentMethod(opt.dataset.method));
  });
}

function wireShippingOptions() {
  document.querySelectorAll('.shipping-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) selectShipping(radio.value);
    });
  });
}

function wireFormatters() {
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const phone = document.getElementById('phone');
  const zipCode = document.getElementById('zipCode');

  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = (value.match(/.{1,4}/g) || []).join(' ');
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
      e.target.value = value;
    });
  }
  if (phone) phone.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
  if (zipCode) zipCode.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
}

function showError(input, message) {
  if (!input) return;
  const formGroup = input.parentElement;
  formGroup.classList.add('invalid');
  const errorSpan = formGroup.querySelector('.error-msg');
  if (errorSpan) errorSpan.textContent = message;
}

function clearError(input) {
  if (!input) return;
  input.parentElement.classList.remove('invalid');
  const errorSpan = input.parentElement.querySelector('.error-msg');
  if (errorSpan) errorSpan.textContent = '';
}

function validateAddressForm() {
  let ok = true;
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const city = document.getElementById('city');
  const zipCode = document.getElementById('zipCode');

  if (!fullName?.value.trim()) { showError(fullName, 'Full Name is required'); ok = false; }
  else clearError(fullName);

  const emailVal = email?.value.trim() || '';
  if (!emailVal) { showError(email, 'Email Address is required'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showError(email, 'Enter a valid email'); ok = false; }
  else clearError(email);

  const phoneVal = phone?.value.trim() || '';
  if (!/^\d{10}$/.test(phoneVal)) { showError(phone, 'Enter valid 10-digit mobile'); ok = false; }
  else clearError(phone);

  if (!address?.value.trim()) { showError(address, 'Street Address is required'); ok = false; }
  else clearError(address);

  if (!city?.value.trim()) { showError(city, 'City is required'); ok = false; }
  else clearError(city);

  if (!/^\d{5,6}$/.test(zipCode?.value.trim() || '')) { showError(zipCode, 'Enter valid 5 or 6-digit PIN code'); ok = false; }
  else clearError(zipCode);

  return ok;
}

function validatePaymentForm() {
  const method = document.querySelector('input[name="paymentMethod"]:checked');
  if (!method) {
    alert('Please select a payment method');
    return false;
  }
  if (method.value !== 'card') return true;

  let ok = true;
  const cardName = document.getElementById('cardName');
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');

  if (!cardName?.value.trim()) { showError(cardName, 'Cardholder Name is required'); ok = false; }
  else clearError(cardName);

  const digits = (cardNumber?.value || '').replace(/\s/g, '');
  if (digits.length !== 16) { showError(cardNumber, 'Card Number must be 16 digits'); ok = false; }
  else clearError(cardNumber);

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry?.value.trim() || '')) {
    showError(cardExpiry, 'Expiry must be MM/YY');
    ok = false;
  } else clearError(cardExpiry);

  if (!/^\d{3}$/.test(cardCvv?.value.trim() || '')) { showError(cardCvv, 'CVV must be 3 digits'); ok = false; }
  else clearError(cardCvv);

  if (!ok) alert('Please fill valid card details');
  return ok;
}

function autoFillUserDetails() {
  const token = localStorage.getItem('lumoraToken');
  if (!token) return;
  fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => (r.ok ? r.json() : null))
    .then((user) => {
      if (!user) return;
      const fullName = document.getElementById('fullName');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      if (user.name && fullName && !fullName.value) fullName.value = user.name;
      if (user.email && email && !email.value) email.value = user.email;
      if (user.phone && phone && !phone.value) phone.value = String(user.phone).replace(/\D/g, '').slice(-10);
    })
    .catch(() => {});
}

function wirePlaceOrder() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAddressForm()) {
      showStep('address');
      return;
    }
    if (!validatePaymentForm()) {
      showStep('payment');
      return;
    }

    cart = safeCart();
    if (!cart.length) {
      alert('Your cart is empty');
      window.location.href = '/cart.html';
      return;
    }

    const submitBtn = document.getElementById('placeOrderBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'PLACING ORDER...';
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';
    const shippingOption = document.querySelector('input[name="shippingOption"]:checked')?.value || 'standard';

    const payload = {
      items: cart.map((item) => ({ bookId: item._id, quantity: item.quantity })),
      shippingAddress: {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim()
      },
      paymentMethod,
      shippingOption
    };

    try {
      const token = localStorage.getItem('lumoraToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.order) {
        localStorage.removeItem('lumoraCart');
        sessionStorage.setItem('lumoraLastOrderId', data.order.orderId);
        try {
          const guest = JSON.parse(localStorage.getItem('lumoraGuestOrders') || '[]');
          if (!guest.includes(data.order.orderId)) {
            guest.unshift(data.order.orderId);
            localStorage.setItem('lumoraGuestOrders', JSON.stringify(guest.slice(0, 20)));
          }
        } catch (err) { /* ignore */ }

        window.location.href = `/order-success.html?orderId=${encodeURIComponent(data.order.orderId)}`;
        return;
      }

      alert(data.message || 'Order failed. Please try again.');
    } catch (err) {
      console.error(err);
      alert('Could not connect to server. Is it running on port 3005?');
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'PLACE ORDER';
    }
  });
}
