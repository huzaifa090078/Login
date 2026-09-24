/**
 * Saved & Pending Orders Component
 * 
 * Features:
 * - View locally stored orders across app restarts / offline sessions
 * - Filter by All, Pending, Sent
 * - Compact order cards: Customer Name | Date | Order Amount
 * - Edit Order: loads saved order into order form without duplicating
 * - Send Order: opens WhatsApp sharing flow (no hardcoded phone number)
 * - Order Details / Preview: Black/Yellow/White preview with Download options:
 *   1. Save to Device (PDF)
 *   2. Send to WhatsApp
 * - Proper Back Navigation: Order Details -> View Orders -> Order Form
 */

import { 
  getSavedOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getPendingOrdersCount,
  getOrderById
} from '../storage.js';
import { 
  formatCurrency, 
  formatDateForWhatsApp, 
  formatInvoiceDateForWhatsApp,
  normalizePakistaniPhoneNumber,
  formatWhatsAppProductBlock,
  loadOrderIntoForm
} from '../state.js';
import { getCategories, getProductById } from '../catalog-data.js';
import { ICONS } from '../icons.js';
import { pushModalNavigation, popModalNavigation, handleBackAction } from '../navigation.js';
import { downloadOrderPdf } from '../pdfGenerator.js';

let activeFilter = 'all'; // 'all' | 'pending' | 'sent'
let currentDetailOrderId = null;

export function renderSavedOrdersModal(container) {
  container.innerHTML = `
    <!-- Saved Orders List Modal -->
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

    <!-- Order Details / Preview Modal -->
    <div class="modal-backdrop" id="order-details-modal" aria-hidden="true">
      <div class="modal-card modal-card-order-details">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title" id="order-details-title">ORDER DETAILS</h3>
            <span class="modal-subtitle" id="order-details-subtitle">Review order & download</span>
          </div>
          <button type="button" class="modal-close-btn" id="order-details-close" aria-label="Close order details">${ICONS.close}</button>
        </div>

        <div class="modal-body" id="order-details-body">
          <!-- Injected dynamic order details -->
        </div>

        <div class="modal-footer modal-footer-details">
          <div class="details-footer-left">
            <button type="button" class="btn-secondary btn-details-back" id="btn-details-back">
              <span>Back</span>
            </button>
          </div>
          <div class="details-footer-right">
            <div class="download-dropdown-wrap">
              <button type="button" class="btn-primary-yellow btn-download-order" id="btn-details-download">
                <span class="btn-icon">${ICONS.download}</span>
                <span>Download</span>
              </button>
              <div class="download-popover-menu" id="download-popover-menu">
                <button type="button" class="download-menu-item" id="btn-dl-save-device">
                  <span class="menu-icon">${ICONS.fileText}</span>
                  <div class="menu-text">
                    <strong>Save to Device</strong>
                    <span>PDF formatted invoice</span>
                  </div>
                </button>
                <button type="button" class="download-menu-item" id="btn-dl-send-whatsapp">
                  <span class="menu-icon">${ICONS.whatsapp}</span>
                  <div class="menu-text">
                    <strong>Send to WhatsApp</strong>
                    <span>Share with chosen contact</span>
                  </div>
                </button>
              </div>
            </div>

            <button type="button" class="btn-primary-yellow btn-details-edit" id="btn-details-edit">
              <span class="btn-icon">${ICONS.edit}</span>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-send-order btn-details-send" id="btn-details-send">
              <span>Send</span>
              <span class="btn-wa-icon">${ICONS.whatsapp}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach modal controls
  const modal = container.querySelector('#saved-orders-modal');
  const closeBtn = container.querySelector('#orders-modal-close');
  const dismissBtn = container.querySelector('#orders-modal-dismiss');
  const filterPills = container.querySelectorAll('.order-filter-pill');

  const detailsModal = container.querySelector('#order-details-modal');
  const detailsCloseBtn = container.querySelector('#order-details-close');
  const detailsBackBtn = container.querySelector('#btn-details-back');
  const detailsDownloadBtn = container.querySelector('#btn-details-download');
  const detailsEditBtn = container.querySelector('#btn-details-edit');
  const detailsSendBtn = container.querySelector('#btn-details-send');
  const downloadPopover = container.querySelector('#download-popover-menu');
  const dlSaveDeviceBtn = container.querySelector('#btn-dl-save-device');
  const dlSendWhatsAppBtn = container.querySelector('#btn-dl-send-whatsapp');

  const closeSavedOrdersModal = ({ fromBack = false } = {}) => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!detailsModal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
    if (!fromBack) {
      popModalNavigation('saved-orders-modal');
    }
  };

  const closeOrderDetailsModal = ({ fromBack = false } = {}) => {
    detailsModal.classList.remove('open');
    detailsModal.setAttribute('aria-hidden', 'true');
    downloadPopover.classList.remove('open');
    currentDetailOrderId = null;
    if (!fromBack) {
      popModalNavigation('order-details-modal');
    }
  };

  // Close handlers
  closeBtn.addEventListener('click', () => {
    handleBackAction() || closeSavedOrdersModal();
  });
  dismissBtn.addEventListener('click', () => {
    handleBackAction() || closeSavedOrdersModal();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleBackAction() || closeSavedOrdersModal();
    }
  });

  detailsCloseBtn.addEventListener('click', () => {
    handleBackAction() || closeOrderDetailsModal();
  });
  detailsBackBtn.addEventListener('click', () => {
    handleBackAction() || closeOrderDetailsModal();
  });
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      handleBackAction() || closeOrderDetailsModal();
    }
  });

  // Download menu toggle
  detailsDownloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadPopover.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.download-dropdown-wrap')) {
      downloadPopover.classList.remove('open');
    }
  });

  dlSaveDeviceBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    downloadPopover.classList.remove('open');
    if (!currentDetailOrderId) return;
    const order = getOrderById(currentDetailOrderId);
    if (!order) return;
    await downloadOrderPdf(order);
  });

  dlSendWhatsAppBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadPopover.classList.remove('open');
    if (!currentDetailOrderId) return;
    handleSendSavedOrder(currentDetailOrderId, container);
  });

  detailsEditBtn.addEventListener('click', () => {
    if (!currentDetailOrderId) return;
    const order = getOrderById(currentDetailOrderId);
    if (order) {
      closeOrderDetailsModal();
      closeSavedOrdersModal();
      handleEditSavedOrder(order);
    }
  });

  detailsSendBtn.addEventListener('click', () => {
    if (!currentDetailOrderId) return;
    handleSendSavedOrder(currentDetailOrderId, container);
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

    pushModalNavigation('saved-orders-modal', ({ fromBack }) => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }
}

export function openOrderDetailsModal(orderId) {
  const detailsModal = document.getElementById('order-details-modal');
  const detailsBody = document.getElementById('order-details-body');
  const detailsTitle = document.getElementById('order-details-title');
  const detailsSubtitle = document.getElementById('order-details-subtitle');
  if (!detailsModal || !detailsBody) return;

  const order = getOrderById(orderId);
  if (!order) return;

  currentDetailOrderId = orderId;

  if (detailsTitle) detailsTitle.textContent = `ORDER: ${order.orderId}`;
  if (detailsSubtitle) detailsSubtitle.textContent = `${order.customerName} • ${formatDateForWhatsApp(order.date)}`;

  const itemsRows = (order.items || []).map((item, idx) => {
    const model = escapeHtml(item.modelNumber || '');
    let productName = escapeHtml(item.productName || item.name || '');
    let modelName = '';
    if (model && productName) {
      modelName = productName.toLowerCase().startsWith(model.toLowerCase()) ? productName : `${model} ${productName}`;
    } else {
      modelName = model || productName || 'Product';
    }

    const variant = escapeHtml(item.variant || item.description || '-');
    const rate = Number(item.rate || 0);
    const qty = Number(item.quantity || 0);
    const lineTotal = Number(item.lineTotal || (rate * qty));

    return `
      <div class="summary-line-item">
        <div class="item-meta">
          <div class="item-model-row">
            <span class="summary-model-badge">${model || (idx + 1)}</span>
            <span class="summary-item-name">${modelName}</span>
          </div>
          <div class="summary-item-variant">${variant}</div>
          <div class="summary-rate-qty-meta">
            ${qty} &times; ${formatCurrency(rate)} = <strong>${formatCurrency(lineTotal)}</strong>
          </div>
        </div>
        <div class="item-line-total">
          ${formatCurrency(lineTotal)}
        </div>
      </div>
    `;
  }).join('');

  detailsBody.innerHTML = `
    <!-- Customer Details Card -->
    <div class="modal-customer-card">
      <div class="modal-customer-title">Customer & Shop Details</div>
      <div class="modal-customer-grid">
        <div>
          <span class="field-lbl">Shop Name:</span>
          <span class="field-val">${escapeHtml(order.shopName) || '-'}</span>
        </div>
        <div>
          <span class="field-lbl">Customer:</span>
          <span class="field-val">${escapeHtml(order.customerName) || '-'}</span>
        </div>
        <div>
          <span class="field-lbl">Customer Number:</span>
          <span class="field-val">${escapeHtml(order.phone) || '-'}</span>
        </div>
        <div>
          <span class="field-lbl">Date:</span>
          <span class="field-val">${formatDateForWhatsApp(order.date)}</span>
        </div>
        <div class="full-col">
          <span class="field-lbl">Address:</span>
          <span class="field-val">${escapeHtml(order.address) || '-'}</span>
        </div>
      </div>
    </div>

    <!-- Items List -->
    <div class="details-items-container">
      <div class="details-section-label">Order Items (${order.totalItems} Units)</div>
      <div class="summary-category-items">
        ${itemsRows}
      </div>
    </div>

    <!-- Grand Totals Card -->
    <div class="summary-grand-card">
      <div class="grand-row">
        <span class="grand-label">TOTAL ITEMS:</span>
        <span class="grand-units-val">${order.totalItems} Units</span>
      </div>
      <div class="grand-row main-total-row">
        <span class="grand-label">GRAND TOTAL:</span>
        <span class="grand-amount-val">${formatCurrency(order.grandTotal)}</span>
      </div>
    </div>
  `;

  detailsModal.classList.add('open');
  detailsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  pushModalNavigation('order-details-modal', ({ fromBack }) => {
    detailsModal.classList.remove('open');
    detailsModal.setAttribute('aria-hidden', 'true');
    const popover = document.getElementById('download-popover-menu');
    if (popover) popover.classList.remove('open');
    currentDetailOrderId = null;
  });
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
        <p>Orders saved or submitted will appear here.</p>
      </div>
    `;
    return;
  }

  listBody.innerHTML = filtered.map(order => {
    const isPending = order.status === 'Pending';
    const statusClass = isPending ? 'status-pending' : 'status-sent';
    const statusText = isPending ? 'Pending' : 'Sent';
    const custDisplay = escapeHtml(order.customerName || order.shopName || 'Customer');
    const dateDisplay = formatDateForWhatsApp(order.date);
    const amountDisplay = formatCurrency(order.grandTotal);

    // Requirement 5 compact header: Customer Name | Date | Order Amount
    // Example: HB | 24 Sep 2026 | Rs. 4,981
    return `
      <div class="saved-order-card ${isPending ? 'pending-card' : ''}" id="saved-order-${order.orderId}">
        <!-- Compact Primary Summary Row -->
        <div class="order-compact-header" role="button" tabindex="0" data-view-order-id="${order.orderId}">
          <div class="compact-info-line">
            <strong class="compact-cust-name">${custDisplay}</strong>
            <span class="compact-divider">|</span>
            <span class="compact-date">${dateDisplay}</span>
            <span class="compact-divider">|</span>
            <strong class="compact-amount">${amountDisplay}</strong>
          </div>
          <span class="order-status-badge ${statusClass}">
            ${statusText}
          </span>
        </div>

        <!-- Meta Sub-row -->
        <div class="order-card-meta-row" role="button" tabindex="0" data-view-order-id="${order.orderId}">
          <span class="order-id-label">${escapeHtml(order.orderId)}</span>
          <span class="order-shop-snippet">${escapeHtml(order.shopName)} • ${order.totalItems} Items</span>
        </div>

        <!-- Action Buttons: Edit Order & Send Order -->
        <div class="order-card-actions">
          <button 
            type="button" 
            class="btn-order-action btn-edit-saved" 
            data-order-id="${order.orderId}"
            title="Edit Order in Catalog"
          >
            <span class="btn-act-icon">${ICONS.edit}</span>
            <span>Edit Order</span>
          </button>

          <button 
            type="button" 
            class="btn-order-action btn-send-saved" 
            data-order-id="${order.orderId}"
            title="Send via WhatsApp"
          >
            <span class="btn-act-icon">${ICONS.whatsapp}</span>
            <span>Send Order</span>
          </button>

          <button 
            type="button" 
            class="btn-order-action btn-view-saved-details" 
            data-order-id="${order.orderId}"
            title="View Details & Download"
          >
            <span>Details</span>
          </button>

          <button 
            type="button" 
            class="btn-delete-order" 
            data-order-id="${order.orderId}"
            aria-label="Delete order"
            title="Delete Order"
          >${ICONS.trash || ICONS.clear}</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach card click to open Order Details
  const viewTriggers = listBody.querySelectorAll('[data-view-order-id], .btn-view-saved-details');
  viewTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const orderId = el.getAttribute('data-view-order-id') || el.getAttribute('data-order-id');
      if (orderId) openOrderDetailsModal(orderId);
    });
  });

  // Attach Edit Order button
  const editBtns = listBody.querySelectorAll('.btn-edit-saved');
  editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orderId = btn.getAttribute('data-order-id');
      const order = getOrderById(orderId);
      if (order) {
        const savedModal = container.querySelector('#saved-orders-modal');
        if (savedModal) {
          savedModal.classList.remove('open');
          savedModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          popModalNavigation('saved-orders-modal');
        }
        handleEditSavedOrder(order);
      }
    });
  });

  // Attach Send Order button
  const sendBtns = listBody.querySelectorAll('.btn-send-saved');
  sendBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orderId = btn.getAttribute('data-order-id');
      handleSendSavedOrder(orderId, container);
    });
  });

  // Attach Delete button
  const deleteBtns = listBody.querySelectorAll('.btn-delete-order');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orderId = btn.getAttribute('data-order-id');
      if (confirm(`Delete order ${orderId}?`)) {
        deleteOrder(orderId);
        populateOrdersList(container);
      }
    });
  });
}

function handleEditSavedOrder(order) {
  loadOrderIntoForm(order);

  // Scroll to top of order form
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Show user feedback that order is loaded in edit mode
  showToastNotification(`Editing Order: ${order.orderId}`);
}

function handleSendSavedOrder(orderId, container) {
  const orders = getSavedOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  // Generate WhatsApp message for saved order in preserved single-line format
  const message = generateSavedOrderWhatsAppMessage(order);
  
  // Requirement 6 & 7: Do NOT bind to hardcoded phone number; allow user to pick recipient
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  // Mark status as Sent
  updateOrderStatus(orderId, 'Sent');
  if (container) {
    populateOrdersList(container);
  }

  // Open WhatsApp
  window.open(waUrl, '_blank');
}

export function generateSavedOrderWhatsAppMessage(order) {
  const divider = '━━━━━━━━━━━━━━━━━━━━';
  const dateStr = formatInvoiceDateForWhatsApp(order.date);

  const shopName = order.shopName ? order.shopName.trim() : '';
  const customerName = order.customerName ? order.customerName.trim() : '';
  const phone = order.phone ? normalizePakistaniPhoneNumber(order.phone) : '';
  const address = order.address ? order.address.trim() : '';

  const categories = getCategories();
  const groupedItems = categories.map(category => ({
    category,
    items: (order.items || []).filter(item => {
      const product = getProductById(item.productId);
      const categoryId = item.categoryId || product?.categoryId || product?.category;
      return categoryId === category.id;
    })
  })).filter(group => group.items.length > 0);

  const uncategorizedItems = (order.items || []).filter(item => {
    const product = getProductById(item.productId);
    const categoryId = item.categoryId || product?.categoryId || product?.category;
    return !categories.some(category => category.id === categoryId);
  });
  if (uncategorizedItems.length > 0) {
    groupedItems.push({
      category: { id: 'other', name: 'Other Items' },
      items: uncategorizedItems
    });
  }

  const allItems = [];
  groupedItems.forEach(group => {
    group.items.forEach(item => allItems.push(item));
  });

  const orderLines = allItems.map(formatWhatsAppProductBlock).join('\n');

  return [
    divider,
    '*LOGIN | WHOLESALE ORDER*',
    divider,
    '',
    '*DATE*',
    dateStr,
    '',
    '*CUSTOMER DETAILS*',
    `Shop Name: ${shopName}`,
    `Customer Name: ${customerName}`,
    `Customer No.: ${phone}`,
    `Address: ${address}`,
    '',
    divider,
    '*ORDER DETAILS*',
    '',
    orderLines,
    '',
    divider,
    `*TOTAL* ${order.totalItems} Items | *${formatCurrency(order.grandTotal)}*`,
    divider,
    '*LOGIN WHOLESALE*',
    'Thank you for your order.'
  ].join('\n');
}

export function showToastNotification(message, duration = 3000) {
  let toast = document.getElementById('login-app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'login-app-toast';
    toast.className = 'login-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
