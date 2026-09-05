/**
 * Saved & Pending Orders Component
 * 
 * Allows the salesperson to:
 * - View locally stored orders across app restarts / offline sessions
 * - Filter by All, Pending, Sent
 * - Send pending orders to WhatsApp (923294254904) when internet returns
 * - Delete completed/canceled orders
 */

import { 
  getSavedOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getPendingOrdersCount 
} from '../storage.js';
import { 
  formatCurrency, 
  formatDateForWhatsApp, 
  WHATSAPP_PHONE 
} from '../state.js';
import { ICONS } from '../icons.js';

let activeFilter = 'all'; // 'all' | 'pending' | 'sent'

export function renderSavedOrdersModal(container) {
  container.innerHTML = `
    <div class="modal-backdrop" id="saved-orders-modal" aria-hidden="true">
      <div class="modal-card modal-card-orders">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title">SAVED ORDERS</h3>
            <span class="modal-subtitle">Stored locally on this device</span>
          </div>
          <button type="button" class="modal-close-btn" id="orders-modal-close" aria-label="Close saved orders">${ICONS.close}</button>
        </div>

        <div class="orders-filter-bar">
          <button type="button" class="order-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button type="button" class="order-filter-pill ${activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
            Pending <span class="badge-count" id="filter-pending-badge">0</span>
          </button>
          <button type="button" class="order-filter-pill ${activeFilter === 'sent' ? 'active' : ''}" data-filter="sent">Sent</button>
        </div>

        <div class="modal-body orders-modal-body" id="orders-list-body">
          <!-- Dynamic Orders List -->
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="orders-modal-dismiss">Back to Order Form</button>
        </div>
      </div>
    </div>
  `;

  // Attach modal controls
  const modal = container.querySelector('#saved-orders-modal');
  const closeBtn = container.querySelector('#orders-modal-close');
  const dismissBtn = container.querySelector('#orders-modal-dismiss');
  const filterPills = container.querySelectorAll('.order-filter-pill');

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  dismissBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      activeFilter = pill.getAttribute('data-filter');
      filterPills.forEach(p => p.classList.toggle('active', p === pill));
      populateOrdersList(container);
    });
  });

  populateOrdersList(container);
}

export function openSavedOrdersModal() {
  const modal = document.getElementById('saved-orders-modal');
  if (modal) {
    populateOrdersList(modal.parentElement);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

export function populateOrdersList(container) {
  const listBody = container.querySelector('#orders-list-body');
  const pendingBadge = container.querySelector('#filter-pending-badge');
  if (!listBody) return;

  const orders = getSavedOrders();
  const pendingCount = getPendingOrdersCount();

  if (pendingBadge) {
    pendingBadge.textContent = pendingCount;
    pendingBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }

  const filtered = orders.filter(o => {
    if (activeFilter === 'pending') return o.status === 'Pending';
    if (activeFilter === 'sent') return o.status === 'Sent';
    return true;
  });

  if (filtered.length === 0) {
    listBody.innerHTML = `
      <div class="empty-orders-state">
        <div class="empty-icon">📁</div>
        <h4>No ${activeFilter === 'all' ? '' : activeFilter} Orders Found</h4>
        <p>Orders saved when offline or submitted will appear here.</p>
      </div>
    `;
    return;
  }

  const isOnline = navigator.onLine;

  listBody.innerHTML = filtered.map(order => {
    const isPending = order.status === 'Pending';
    const statusClass = isPending ? 'status-pending' : 'status-sent';
    const statusIcon = isPending ? 'Pending' : 'Sent';

    const itemsPreview = (order.items || []).map(i => 
      `${i.quantity}× ${escapeHtml(i.modelNumber)} (${escapeHtml(i.productName)} - ${escapeHtml(i.variant)})`
    ).join('<br>');

    return `
      <div class="saved-order-card ${isPending ? 'pending-card' : ''}" id="saved-order-${order.orderId}">
        <div class="order-card-top">
          <div>
            <div class="order-id-tag">${escapeHtml(order.orderId)}</div>
            <div class="order-date-text">${formatDateForWhatsApp(order.date)}</div>
          </div>
          <span class="order-status-badge ${statusClass}">
            ${statusIcon}
          </span>
        </div>

        <div class="order-card-customer">
          <div><strong>Shop:</strong> ${escapeHtml(order.shopName)}</div>
          <div><strong>Customer:</strong> ${escapeHtml(order.customerName)}</div>
          ${order.phone ? `<div><strong>Phone:</strong> ${escapeHtml(order.phone)}</div>` : ''}
          <div><strong>Address:</strong> ${escapeHtml(order.address)}</div>
        </div>

        <div class="order-card-items-snippet">
          ${itemsPreview}
        </div>

        <div class="order-card-totals">
          <span>Items: <strong>${order.totalItems} Units</strong></span>
          <span class="order-card-grand">Total: <strong>${formatCurrency(order.grandTotal)}</strong></span>
        </div>

        <div class="order-card-actions">
          ${isPending ? `
            <button 
              type="button" 
              class="btn-send-pending-wa" 
              data-order-id="${order.orderId}"
              ${!isOnline ? 'title="Connect to internet to send"' : ''}
            >
              <span>Send on WhatsApp</span>
              <span>${ICONS.whatsapp}</span>
            </button>
          ` : `
            <button 
              type="button" 
              class="btn-resend-wa" 
              data-order-id="${order.orderId}"
            >
              <span>Resend WhatsApp</span>
              <span>${ICONS.whatsapp}</span>
            </button>
          `}
          
          <button 
            type="button" 
            class="btn-delete-order" 
            data-order-id="${order.orderId}"
            aria-label="Delete order"
          >${ICONS.clear}</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach action button events
  const sendBtns = listBody.querySelectorAll('.btn-send-pending-wa, .btn-resend-wa');
  sendBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      handleSendSavedOrder(orderId, container);
    });
  });

  const deleteBtns = listBody.querySelectorAll('.btn-delete-order');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      if (confirm(`Delete order ${orderId}?`)) {
        deleteOrder(orderId);
        populateOrdersList(container);
      }
    });
  });
}

function handleSendSavedOrder(orderId, container) {
  if (!navigator.onLine) {
    alert("You're currently offline. Please connect to the internet to send this order on WhatsApp.");
    return;
  }

  const orders = getSavedOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  // Generate WhatsApp message for saved order
  const message = generateSavedOrderWhatsAppMessage(order);
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  // Mark status as Sent
  updateOrderStatus(orderId, 'Sent');
  populateOrdersList(container);

  // Open WhatsApp in new tab
  window.open(waUrl, '_blank');
}

export function generateSavedOrderWhatsAppMessage(order) {
  const divider = '━━━━━━━━━━━━━━━━━━━━';
  const dateStr = formatDateForWhatsApp(order.date);

  const shopName = order.shopName ? order.shopName.trim() : '';
  const customerName = order.customerName ? order.customerName.trim() : '';
  const phone = order.phone ? order.phone.trim() : '';
  const address = order.address ? order.address.trim() : '';

  // 1. Header Section
  let msg = `${divider}\n`;
  msg += `*LOGIN ORDER INVOICE*\n`;
  msg += `Date: ${dateStr}\n`;
  msg += `${divider}\n`;

  // 2. Customer Information Section (concise lines)
  msg += `Shop Name: ${shopName}\n`;
  msg += `Customer Name: ${customerName}\n`;
  if (phone) {
    msg += `Phone: ${phone}\n`;
  }
  msg += `Address: ${address}\n`;
  msg += `${divider}\n`;

  // 3. Product Section: each item in a 2-line block (Model / Description, then Rate / Qty / Total)
  const productBlocks = (order.items || []).map(item => {
    let desc = item.productName || item.name || '';
    if (item.variant && !desc.toLowerCase().includes(item.variant.toLowerCase())) {
      desc += ` - ${item.variant}`;
    }
    if (!desc) desc = item.description || item.modelNumber || '';
    const line1 = `*${item.modelNumber}* / ${desc}`;
    const line2 = `Rate: ${formatCurrency(item.rate)} / Qty: ${item.quantity} / Total: ${formatCurrency(item.lineTotal)}`;
    return `${line1}\n${line2}`;
  });

  if (productBlocks.length > 0) {
    msg += productBlocks.join('\n\n') + '\n';
  }
  msg += `${divider}\n`;

  // 4. Totals Section & Thank You Line
  msg += `Total Items: ${order.totalItems}\n`;
  msg += `Grand Total: ${formatCurrency(order.grandTotal)}\n`;
  msg += `${divider}\n`;
  msg += `Thank you for your order!`;

  return msg;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
