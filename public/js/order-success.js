// ============================================
// LUMORA BOOKS - ORDER SUCCESS PAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || sessionStorage.getItem('lumoraLastOrderId');

  if (!orderId) {
    renderError('No order found. Please place an order first.', true);
    return;
  }

  loadOrder(orderId);
});

async function loadOrder(orderId) {
  const token = localStorage.getItem('lumoraToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { headers });
    const data = await res.json();

    if (!res.ok || !data.order) {
      renderError(data.message || 'Order not found.', true);
      return;
    }

    sessionStorage.setItem('lumoraLastOrderId', data.order.orderId);
    rememberGuestOrder(data.order.orderId);
    renderSuccess(data.order);
  } catch (err) {
    console.error(err);
    renderError('Could not load order details. Please try again.', false);
  }
}

function rememberGuestOrder(orderId) {
  try {
    const list = JSON.parse(localStorage.getItem('lumoraGuestOrders') || '[]');
    if (!list.includes(orderId)) {
      list.unshift(orderId);
      localStorage.setItem('lumoraGuestOrders', JSON.stringify(list.slice(0, 20)));
    }
  } catch (e) { /* ignore */ }
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function paymentLabel(method) {
  const map = {
    card: 'Credit / Debit Card',
    upi: 'UPI',
    cod: 'Cash on Delivery',
    online: 'Online Payment',
    netbanking: 'Net Banking',
    wallet: 'Wallet'
  };
  return map[method] || method || '—';
}

function renderError(message, showShop) {
  const card = document.getElementById('successCard');
  card.innerHTML = `
    <div class="orders-empty" style="display:flex;">
      <h2>Something went wrong</h2>
      <p>${message}</p>
      ${showShop ? '<a href="/books.html" class="btn btn-primary hover-lift">CONTINUE SHOPPING</a>' : `
        <button class="btn btn-secondary" onclick="location.reload()">RETRY</button>
      `}
    </div>
  `;
}

function renderSuccess(order) {
  const addr = order.shippingAddress || {};
  const method = order.paymentMethod || 'card';
  const payStatus = order.paymentStatus || (method === 'cod' ? 'Pending' : 'Paid');
  const badgeColor = payStatus === 'Paid' ? '#27ae60' : payStatus === 'Pending' ? '#e67e22' : '#e74c3c';

  const itemsHtml = (order.items || []).map((item) => `
    <div class="receipt-item">
      <span class="receipt-item-name">${item.title} <span class="receipt-item-qty">x${item.quantity}</span></span>
      <strong style="color: var(--ink);">₹${item.itemTotal != null ? item.itemTotal : item.price * item.quantity}</strong>
    </div>
  `).join('');

  const card = document.getElementById('successCard');
  card.innerHTML = `
    <div class="success-icon-wrapper">
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
    </div>
    <h2 class="success-title">Order Placed Successfully!</h2>
    <p class="success-message">
      Thank you${order.customer?.fullName ? `, ${order.customer.fullName}` : ''}.
      A confirmation has been prepared for
      <span style="font-weight:600;color:var(--burgundy);">${addr.email || order.customer?.email || ''}</span>.
    </p>

    <div class="receipt-box" id="printableReceipt">
      <div class="receipt-header">
        <h3 class="receipt-title">LUMORA BOOKS RECEIPT</h3>
        <span class="payment-badge" style="background-color:${badgeColor};">${payStatus.toUpperCase()}</span>
      </div>

      <div class="receipt-row">
        <span>Order Number:</span>
        <strong style="color:var(--burgundy);font-family:monospace;">${order.orderId}</strong>
      </div>
      <div class="receipt-row">
        <span>Order Date:</span>
        <span>${formatDate(order.createdAt)}</span>
      </div>
      <div class="receipt-row">
        <span>Payment Method:</span>
        <span>${paymentLabel(method)}</span>
      </div>
      <div class="receipt-row">
        <span>Tracking Number:</span>
        <strong style="font-family:monospace;">${order.trackingNumber || 'Assigned soon'}</strong>
      </div>
      <div class="receipt-row">
        <span>Estimated Delivery:</span>
        <span>${formatDate(order.estimatedDelivery).split(',')[0]}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-shipping-details">
        <h4 style="font-size:0.85rem;text-transform:uppercase;color:var(--muted);letter-spacing:0.05em;margin-bottom:6px;">Delivery Address</h4>
        <p style="font-weight:600;margin-bottom:2px;">${addr.fullName || ''}</p>
        <p style="color:var(--muted);font-size:0.9rem;line-height:1.4;">
          ${addr.address || ''}${addr.city ? ', ' + addr.city : ''}${addr.zipCode ? ' - ' + addr.zipCode : ''}
        </p>
        <p style="color:var(--muted);font-size:0.85rem;margin-top:4px;">Phone: +91 ${addr.phone || ''}</p>
      </div>

      <div class="receipt-divider"></div>
      <div class="receipt-items">${itemsHtml}</div>
      <div class="receipt-divider"></div>

      <div class="receipt-row"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      ${order.discount ? `<div class="receipt-row"><span>Discount</span><span>-₹${order.discount}</span></div>` : ''}
      <div class="receipt-row"><span>Shipping</span><span>${order.shippingFee === 0 ? 'FREE' : '₹' + order.shippingFee}</span></div>
      <div class="receipt-row receipt-total">
        <span>Total Amount</span>
        <strong style="color:var(--burgundy);font-size:1.3rem;">₹${order.total}</strong>
      </div>
      ${method === 'cod' ? `
        <p style="margin-top:1rem;padding:0.85rem 1rem;background:rgba(230,126,34,0.1);border-radius:6px;color:#9a5b12;font-size:0.9rem;">
          You will pay <strong>₹${order.total}</strong> when your order is delivered.
        </p>
      ` : ''}
    </div>

    <div class="success-actions" style="flex-wrap:wrap;">
      <a href="/track-order.html?orderId=${encodeURIComponent(order.orderId)}" class="btn btn-primary hover-lift">TRACK ORDER</a>
      <a href="/orders.html" class="btn btn-secondary hover-lift">VIEW MY ORDERS</a>
      <a href="/books.html" class="btn btn-secondary hover-lift">CONTINUE SHOPPING</a>
      <button type="button" class="btn btn-secondary hover-lift" onclick="window.print()">PRINT INVOICE</button>
    </div>
  `;
}
