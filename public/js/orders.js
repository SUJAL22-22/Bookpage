// ============================================
// LUMORA BOOKS - MY ORDERS PAGE
// ============================================

const ordersContainer = document.getElementById('ordersContainer');
const ordersEmpty = document.getElementById('ordersEmpty');

document.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
});

async function fetchOrders() {
  const token = localStorage.getItem('lumoraToken');

  if (!token) {
    const guestIds = JSON.parse(localStorage.getItem('lumoraGuestOrders') || '[]');
    if (guestIds.length > 0) {
      await loadGuestOrders(guestIds);
      return;
    }

    ordersContainer.innerHTML = `
      <div class="orders-empty" style="display: flex;">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2>Login Required</h2>
        <p>Please login to view your orders, or place an order to see guest receipts.</p>
        <a href="/login.html" class="btn btn-primary hover-lift">LOGIN</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch('/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    if (response.ok && data.orders && data.orders.length > 0) {
      renderOrders(data.orders);
    } else {
      // Fall back to guest receipts if account has none yet
      const guestIds = JSON.parse(localStorage.getItem('lumoraGuestOrders') || '[]');
      if (guestIds.length > 0) {
        await loadGuestOrders(guestIds);
      } else {
        showEmptyState();
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ordersContainer.innerHTML = `
      <div class="orders-loading">
        <p style="color: #e74c3c;">Error loading orders. Please try again.</p>
        <button onclick="fetchOrders()" class="btn btn-secondary hover-lift" style="margin-top: 1rem;">RETRY</button>
      </div>
    `;
  }
}

async function loadGuestOrders(ids) {
  const token = localStorage.getItem('lumoraToken');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { headers });
        const data = await res.json();
        return res.ok ? data.order : null;
      } catch (e) {
        return null;
      }
    })
  );

  const orders = results.filter(Boolean);
  if (orders.length === 0) {
    showEmptyState();
    return;
  }
  renderOrders(orders);
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('ship')) return 'shipped';
  if (s.includes('process') || s.includes('out for')) return 'processing';
  if (s.includes('confirm') || s.includes('placed') || s.includes('paid')) return 'confirmed';
  return 'confirmed';
}

function canCancelStatus(status) {
  const blocked = ['shipped', 'out for delivery', 'delivered', 'cancelled', 'returned'];
  return !blocked.includes((status || '').toLowerCase());
}

function renderOrders(orders) {
  if (ordersEmpty) ordersEmpty.style.display = 'none';
  ordersContainer.style.display = 'flex';

  ordersContainer.innerHTML = orders.map((order) => {
    const status = order.orderStatus || order.status || 'Order Placed';
    const payStatus = order.paymentStatus || '—';
    const id = order.orderId || order._id;

    return `
    <div class="order-card" data-order-id="${id}">
      <div class="order-header">
        <div>
          <p class="order-id">Order ID: <strong>${order.orderId}</strong></p>
          <p class="order-date">${formatDate(order.createdAt)}</p>
          <p class="order-date">Payment: ${payStatus} · ${paymentLabel(order.paymentMethod)}</p>
        </div>
        <span class="order-status ${statusClass(status)}">${status}</span>
      </div>

      <div class="order-items">
        ${(order.items || []).map((item) => `
          <div class="order-item">
            <img src="${item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'}" alt="${item.title}" class="order-item-img">
            <div class="order-item-details">
              <h4 class="order-item-title">${item.title}</h4>
              <p class="order-item-qty">Qty: ${item.quantity}</p>
            </div>
            <div class="order-item-price">₹${item.itemTotal != null ? item.itemTotal : item.price * item.quantity}</div>
          </div>
        `).join('')}
      </div>

      <div class="order-totals">
        <div class="order-total">Total: <span>₹${order.total}</span></div>
      </div>

      <div class="order-actions">
        <a class="order-btn" href="/order-success.html?orderId=${encodeURIComponent(order.orderId)}">VIEW DETAILS</a>
        <a class="order-btn primary" href="/track-order.html?orderId=${encodeURIComponent(order.orderId)}">TRACK ORDER</a>
        ${canCancelStatus(status) ? `
          <button class="order-btn danger" type="button" onclick="cancelOrder('${order.orderId}')">CANCEL ORDER</button>
        ` : ''}
        <button class="order-btn" type="button" onclick="window.open('/order-success.html?orderId=${encodeURIComponent(order.orderId)}','_blank');">INVOICE</button>
      </div>
    </div>
  `;
  }).join('');
}

function paymentLabel(method) {
  const map = {
    card: 'Card',
    upi: 'UPI',
    cod: 'COD',
    online: 'Online',
    netbanking: 'Net Banking',
    wallet: 'Wallet'
  };
  return map[method] || method || '—';
}

function showEmptyState() {
  ordersContainer.style.display = 'none';
  ordersEmpty.style.display = 'flex';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function cancelOrder(orderId) {
  if (!confirm('Cancel this order? Stock will be restored if eligible.')) return;

  const token = localStorage.getItem('lumoraToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ reason: 'Cancelled by customer' })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Could not cancel order');
      return;
    }

    alert('Order cancelled successfully.');
    fetchOrders();
  } catch (err) {
    console.error(err);
    alert('Error cancelling order. Please try again.');
  }
}

window.cancelOrder = cancelOrder;
window.fetchOrders = fetchOrders;
