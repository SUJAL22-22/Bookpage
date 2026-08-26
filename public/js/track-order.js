// ============================================
// LUMORA BOOKS - ORDER TRACKING PAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || sessionStorage.getItem('lumoraLastOrderId');

  if (!orderId) {
    document.getElementById('trackContainer').innerHTML = `
      <div class="orders-empty" style="display:flex;">
        <h2>No order selected</h2>
        <p>Open tracking from My Orders or your confirmation page.</p>
        <a href="/orders.html" class="btn btn-primary">MY ORDERS</a>
      </div>
    `;
    return;
  }

  loadTracking(orderId);
});

async function loadTracking(orderId) {
  const token = localStorage.getItem('lumoraToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/track`, { headers });
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('trackContainer').innerHTML = `
        <div class="orders-empty" style="display:flex;">
          <h2>Tracking unavailable</h2>
          <p>${data.message || 'Order not found'}</p>
          <a href="/orders.html" class="btn btn-primary">BACK TO ORDERS</a>
        </div>
      `;
      return;
    }

    renderTracking(data);
  } catch (err) {
    console.error(err);
    document.getElementById('trackContainer').innerHTML = `
      <div class="orders-empty" style="display:flex;">
        <h2>Error</h2>
        <p>Could not load tracking. Please try again.</p>
        <button class="btn btn-secondary" onclick="location.reload()">RETRY</button>
      </div>
    `;
  }
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function stepIcon(status, completed, active) {
  if (completed) return '✓';
  const icons = {
    'Order Placed': '✓',
    'Confirmed': '✓',
    'Processing': '📦',
    'Shipped': '🚚',
    'Out for Delivery': '📦',
    'Delivered': '🏠'
  };
  return active ? (icons[status] || '•') : '○';
}

function renderTracking(data) {
  const addr = data.deliveryAddress || {};
  const timeline = data.timeline || { steps: [] };
  const cancelled = timeline.cancelled;

  const stepsHtml = (timeline.steps || []).map((step, i, arr) => `
    <div class="track-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}">
      <div class="track-step-marker">
        <span class="track-dot">${stepIcon(step.status, step.completed, step.active)}</span>
        ${i < arr.length - 1 ? `<span class="track-line ${step.completed ? 'filled' : ''}"></span>` : ''}
      </div>
      <div class="track-step-content">
        <h4>${step.status}</h4>
        <p>${step.active ? 'Current status' : step.completed ? 'Completed' : 'Pending'}</p>
      </div>
    </div>
  `).join('');

  const itemsHtml = (data.items || []).map((item) => `
    <div class="order-item">
      <img src="${item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'}" alt="${item.title}" class="order-item-img">
      <div class="order-item-details">
        <h4 class="order-item-title">${item.title}</h4>
        <p class="order-item-qty">Qty: ${item.quantity}</p>
      </div>
      <div class="order-item-price">₹${item.itemTotal != null ? item.itemTotal : item.price * item.quantity}</div>
    </div>
  `).join('');

  document.getElementById('trackContainer').innerHTML = `
    <div class="track-hero order-card">
      <div class="order-header">
        <div>
          <p class="order-id">Order ID: <strong>${data.orderId}</strong></p>
          <p class="order-date">Placed on ${formatDate(data.createdAt)}</p>
        </div>
        <span class="order-status ${(data.orderStatus || '').toLowerCase().replace(/\s+/g, '-')}">${data.orderStatus}</span>
      </div>

      <div class="track-meta-grid">
        <div>
          <p class="track-meta-label">Tracking Number</p>
          <p class="track-meta-value">${data.trackingNumber || '—'}</p>
        </div>
        <div>
          <p class="track-meta-label">Shipping</p>
          <p class="track-meta-value">${data.shippingLabel || data.shippingMethod || '—'}</p>
        </div>
        <div>
          <p class="track-meta-label">Estimated Delivery</p>
          <p class="track-meta-value">${formatDate(data.estimatedDelivery)}</p>
        </div>
        <div>
          <p class="track-meta-label">Payment</p>
          <p class="track-meta-value">${data.paymentStatus || '—'}</p>
        </div>
      </div>

      ${cancelled ? `
        <div class="track-cancelled-banner">This order was cancelled / returned. Tracking timeline is inactive.</div>
      ` : `
        <div class="track-timeline">${stepsHtml}</div>
      `}

      <div class="receipt-divider" style="margin:1.5rem 0;"></div>

      <h3 style="font-family:'Playfair Display',serif;margin-bottom:0.75rem;">Delivery Address</h3>
      <p style="font-weight:600;">${addr.fullName || ''}</p>
      <p style="color:var(--muted);line-height:1.5;">
        ${addr.address || ''}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''}${addr.zipCode ? ' - ' + addr.zipCode : ''}
      </p>
      <p style="color:var(--muted);font-size:0.9rem;margin-top:0.35rem;">+91 ${addr.phone || ''}</p>

      <div class="receipt-divider" style="margin:1.5rem 0;"></div>
      <h3 style="font-family:'Playfair Display',serif;margin-bottom:1rem;">Items</h3>
      <div class="order-items">${itemsHtml}</div>

      <div class="order-totals">
        <div class="order-total">Total: <span>₹${data.total}</span></div>
      </div>

      <div class="order-actions">
        <a href="/orders.html" class="order-btn">MY ORDERS</a>
        <a href="/order-success.html?orderId=${encodeURIComponent(data.orderId)}" class="order-btn">VIEW RECEIPT</a>
        <a href="/books.html" class="order-btn primary">CONTINUE SHOPPING</a>
      </div>
    </div>
  `;
}
