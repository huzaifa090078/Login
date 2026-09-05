/**
 * Order Summary & WhatsApp Dispatch Component (Offline-First)
 * 
 * Rules:
 * - When online: Opens WhatsApp with 923294254904 deep link and saves with status 'Sent'
 * - When offline: Saves locally with status 'Pending' and informs user:
 *   "You're offline. Order saved on this device. Connect to the internet to send it on WhatsApp."
 * - Pre-send validation: Shop Name, Customer Name, Address, Total Items > 0
 */

import { 
  getState, 
  getTotalItems, 
  getGrandTotal, 
  getOrderSummaryGrouped, 
  formatCurrency, 
  validateOrder, 
  isValidPakistaniPhoneNumber,
  normalizePakistaniPhoneNumber,
  getWhatsAppUrl,
  WHATSAPP_PHONE,
  setQuantity,
  updateCustomerInfo
} from '../state.js';
import { saveOrder } from '../storage.js';
import { openSavedOrdersModal } from './savedOrders.js';
import { ICONS, getCategoryIcon } from '../icons.js';

export function renderOrderSummary(container) {
  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();

  container.innerHTML = `
    <!-- Sticky Bottom Bar -->
    <div class="bottom-order-bar" id="order-summary-bar">
      <div class="order-metrics" id="bar-view-summary" role="button" aria-label="View order breakdown" tabindex="0">
        <div class="metrics-row-top">
          <span class="metrics-label">TOTAL ITEMS:</span>
          <span class="metric-items-badge" id="summary-items-count">${totalItems}</span>
          <button type="button" class="btn-view-details metrics-view-hint" id="btn-view-details" aria-label="View Order Details">
            View Details
          </button>
        </div>
        <div class="metrics-row-bottom">
          <span class="metrics-grand-label">GRAND TOTAL:</span>
          <span class="metric-grand-total" id="summary-grand-total">${formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <button 
        type="button" 
        class="btn-send-order" 
        id="btn-send-order"
        aria-label="Send Order to WhatsApp"
      >
        <span>SEND ORDER</span>
        <span class="btn-wa-icon">${ICONS.whatsapp}</span>
      </button>
    </div>

    <!-- Order Summary Modal -->
    <div class="modal-backdrop" id="order-summary-modal" aria-hidden="true">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title">WHOLESALE ORDER SUMMARY</h3>
            <span class="modal-subtitle">Review items & send to WhatsApp (+92 329 4254904)</span>
          </div>
          <button type="button" class="modal-close-btn" id="modal-close-btn" aria-label="Close summary">${ICONS.close}</button>
        </div>
        
        <div class="modal-body" id="modal-content-body">
          <!-- Dynamic category-grouped content injected on open -->
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="modal-btn-dismiss">Back to Catalog</button>
          <button type="button" class="btn-send-order btn-modal-send" id="modal-btn-confirm-order">
            <span>SEND ORDER</span>
            <span>${ICONS.whatsapp}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Validation Error Modal -->
    <div class="modal-backdrop" id="validation-error-modal" aria-hidden="true">
      <div class="modal-card modal-card-validation">
        <div class="modal-header header-validation-error">
          <div class="modal-title-wrap">
            <h3 class="modal-title error-title">ORDER INCOMPLETE</h3>
            <span class="modal-subtitle">Please provide the required details</span>
          </div>
          <button type="button" class="modal-close-btn" id="validation-close-btn" aria-label="Close">${ICONS.close}</button>
        </div>
        
        <div class="modal-body validation-modal-body">
          <p class="validation-intro">Cannot send order yet. The following details are required:</p>
          <ul class="validation-error-list" id="validation-error-list"></ul>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-validation-ok" id="validation-ok-btn">OK, I will fill these</button>
        </div>
      </div>
    </div>

    <!-- Offline Order Saved Dialog -->
    <div class="modal-backdrop" id="offline-saved-modal" aria-hidden="true">
      <div class="modal-card modal-card-offline">
        <div class="modal-header header-offline-saved">
          <div class="modal-title-wrap">
            <h3 class="modal-title">ORDER SAVED OFFLINE</h3>
            <span class="modal-subtitle" id="offline-saved-order-id">Order Saved</span>
          </div>
          <button type="button" class="modal-close-btn" id="offline-modal-close" aria-label="Close">${ICONS.close}</button>
        </div>

        <div class="modal-body offline-modal-body">
          <div class="offline-icon-banner">OFFLINE MODE</div>
          <p class="offline-main-msg">
            <strong>You're offline. Order saved on this device.</strong><br>
            Connect to the internet to send it on WhatsApp.
          </p>
          <div class="offline-order-summary-box" id="offline-saved-summary-box"></div>
        </div>

        <div class="modal-footer offline-modal-footer">
          <button type="button" class="btn-secondary" id="btn-offline-view-pending">View Pending Orders</button>
          <button type="button" class="btn-primary-yellow" id="btn-offline-start-new">Start New Order</button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const sendOrderBtn = container.querySelector('#btn-send-order');
  const viewSummaryMetrics = container.querySelector('#bar-view-summary');
  const summaryModal = container.querySelector('#order-summary-modal');
  const summaryCloseBtn = container.querySelector('#modal-close-btn');
  const summaryDismissBtn = container.querySelector('#modal-btn-dismiss');
  const modalSendBtn = container.querySelector('#modal-btn-confirm-order');

  const validationModal = container.querySelector('#validation-error-modal');
  const validationCloseBtn = container.querySelector('#validation-close-btn');
  const validationOkBtn = container.querySelector('#validation-ok-btn');

  const offlineModal = container.querySelector('#offline-saved-modal');
  const offlineCloseBtn = container.querySelector('#offline-modal-close');
  const offlineViewPendingBtn = container.querySelector('#btn-offline-view-pending');
  const offlineStartNewBtn = container.querySelector('#btn-offline-start-new');

  const openSummaryModal = () => {
    populateModalContent(container);
    summaryModal.classList.add('open');
    summaryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeSummaryModal = () => {
    summaryModal.classList.remove('open');
    summaryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showValidationErrors = (errors) => {
    const listEl = container.querySelector('#validation-error-list');
    listEl.innerHTML = errors.map(err => `<li><span>❌</span> ${escapeHtml(err)}</li>`).join('');
    
    validationModal.classList.add('open');
    validationModal.setAttribute('aria-hidden', 'false');

    highlightMissingCustomerFields();
  };

  const closeValidationModal = () => {
    validationModal.classList.remove('open');
    validationModal.setAttribute('aria-hidden', 'true');
    
    // Focus first invalid field
    const state = getState();
    if (!state.customerInfo.shopName || !state.customerInfo.shopName.trim()) {
      const el = document.getElementById('input-shop-name');
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else if (!state.customerInfo.customerName || !state.customerInfo.customerName.trim()) {
      const el = document.getElementById('input-customer-name');
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else if (!state.customerInfo.phone || !state.customerInfo.phone.trim() || !isValidPakistaniPhoneNumber(state.customerInfo.phone)) {
      const el = document.getElementById('input-customer-phone');
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else if (!state.customerInfo.address || !state.customerInfo.address.trim()) {
      const el = document.getElementById('input-address');
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else if (getTotalItems() <= 0) {
      const el = document.getElementById('global-search-input') || document.getElementById('category-mount');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  };

  const showOfflineSavedDialog = (savedOrder) => {
    const orderIdEl = container.querySelector('#offline-saved-order-id');
    const summaryBox = container.querySelector('#offline-saved-summary-box');

    if (orderIdEl) orderIdEl.textContent = `Order ID: ${savedOrder.orderId}`;
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="offline-summary-row"><span>Shop:</span> <strong>${escapeHtml(savedOrder.shopName)}</strong></div>
        <div class="offline-summary-row"><span>Customer:</span> <strong>${escapeHtml(savedOrder.customerName)}</strong></div>
        <div class="offline-summary-row"><span>Phone:</span> <strong>${escapeHtml(savedOrder.phone || '-')}</strong></div>
        <div class="offline-summary-row"><span>Items:</span> <strong>${savedOrder.totalItems} Units</strong></div>
        <div class="offline-summary-row"><span>Grand Total:</span> <strong>${formatCurrency(savedOrder.grandTotal)}</strong></div>
      `;
    }

    offlineModal.classList.add('open');
    offlineModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeOfflineModal = () => {
    offlineModal.classList.remove('open');
    offlineModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const executeSendOrder = () => {
    const state = getState();
    const validation = validateOrder(state);

    if (!validation.isValid) {
      closeSummaryModal();
      showValidationErrors(validation.errors);
      return;
    }

    // Build structured order payload
    const grouped = getOrderSummaryGrouped();
    const allItems = [];
    grouped.forEach(g => {
      g.items.forEach(i => allItems.push(i));
    });

    const orderPayload = {
      date: state.customerInfo.date,
      shopName: state.customerInfo.shopName,
      customerName: state.customerInfo.customerName,
      phone: normalizePakistaniPhoneNumber(state.customerInfo.phone),
      address: state.customerInfo.address,
      items: allItems,
      totalItems: getTotalItems(),
      grandTotal: getGrandTotal()
    };

    const isOnline = navigator.onLine;

    if (!isOnline) {
      // OFFLINE: Save locally with status 'Pending'
      orderPayload.status = 'Pending';
      const saved = saveOrder(orderPayload);

      closeSummaryModal();
      showOfflineSavedDialog(saved);
      return;
    }

    // ONLINE: Save with status 'Sent' and open WhatsApp deep link
    orderPayload.status = 'Sent';
    saveOrder(orderPayload);

    const waUrl = getWhatsAppUrl(state);
    window.open(waUrl, '_blank');

    closeSummaryModal();
  };

  // Reset form for next order
  const resetOrderForm = () => {
    const state = getState();
    // Clear cart
    Object.keys(state.cart).forEach(productId => {
      setQuantity(productId, 0);
    });
    // Clear customer inputs
    updateCustomerInfo('shopName', '');
    updateCustomerInfo('customerName', '');
    updateCustomerInfo('phone', '');
    updateCustomerInfo('address', '');

    const shopEl = document.getElementById('input-shop-name');
    const custEl = document.getElementById('input-customer-name');
    const phoneEl = document.getElementById('input-customer-phone');
    const addrEl = document.getElementById('input-address');
    if (shopEl) shopEl.value = '';
    if (custEl) custEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (addrEl) addrEl.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bind Listeners
  sendOrderBtn.addEventListener('click', executeSendOrder);
  modalSendBtn.addEventListener('click', executeSendOrder);

  const viewDetailsBtn = container.querySelector('#btn-view-details');
  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSummaryModal();
    });
  }

  viewSummaryMetrics.addEventListener('click', openSummaryModal);
  viewSummaryMetrics.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSummaryModal();
    }
  });

  summaryCloseBtn.addEventListener('click', closeSummaryModal);
  summaryDismissBtn.addEventListener('click', closeSummaryModal);
  summaryModal.addEventListener('click', (e) => {
    if (e.target === summaryModal) closeSummaryModal();
  });

  validationCloseBtn.addEventListener('click', closeValidationModal);
  validationOkBtn.addEventListener('click', closeValidationModal);
  validationModal.addEventListener('click', (e) => {
    if (e.target === validationModal) closeValidationModal();
  });

  offlineCloseBtn.addEventListener('click', closeOfflineModal);
  offlineViewPendingBtn.addEventListener('click', () => {
    closeOfflineModal();
    openSavedOrdersModal();
  });
  offlineStartNewBtn.addEventListener('click', () => {
    closeOfflineModal();
    resetOrderForm();
  });
}

function highlightMissingCustomerFields() {
  const state = getState();
  const shopNameInput = document.getElementById('input-shop-name');
  const customerNameInput = document.getElementById('input-customer-name');
  const customerPhoneInput = document.getElementById('input-customer-phone');
  const addressInput = document.getElementById('input-address');

  if (shopNameInput) {
    if (!state.customerInfo.shopName || !state.customerInfo.shopName.trim()) {
      shopNameInput.classList.add('input-error');
    } else {
      shopNameInput.classList.remove('input-error');
    }
  }

  if (customerNameInput) {
    if (!state.customerInfo.customerName || !state.customerInfo.customerName.trim()) {
      customerNameInput.classList.add('input-error');
    } else {
      customerNameInput.classList.remove('input-error');
    }
  }

  if (customerPhoneInput) {
    if (!state.customerInfo.phone || !state.customerInfo.phone.trim() || !isValidPakistaniPhoneNumber(state.customerInfo.phone)) {
      customerPhoneInput.classList.add('input-error');
    } else {
      customerPhoneInput.classList.remove('input-error');
    }
  }

  if (addressInput) {
    if (!state.customerInfo.address || !state.customerInfo.address.trim()) {
      addressInput.classList.add('input-error');
    } else {
      addressInput.classList.remove('input-error');
    }
  }
}

export function updateOrderSummary(container) {
  const itemsCountEl = container.querySelector('#summary-items-count');
  const grandTotalEl = container.querySelector('#summary-grand-total');

  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();

  if (itemsCountEl) itemsCountEl.textContent = totalItems;
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
}

function populateModalContent(container) {
  const state = getState();
  const modalBody = container.querySelector('#modal-content-body');
  const groupedSummary = getOrderSummaryGrouped();
  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();

  if (groupedSummary.length === 0) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--login-gray-600);">
        <div style="margin-bottom: 8px; color: var(--login-gray-400);">${ICONS.package}</div>
        <h4 style="color: var(--login-black); margin-bottom: 6px; font-weight: 700;">Your Order is Empty</h4>
        <p style="font-size: 0.85rem;">Select products and adjust quantities from the catalog or search bar.</p>
      </div>
    `;
    return;
  }

  // Render Customer details header
  const customerInfoHtml = `
    <div class="modal-customer-card">
      <div class="modal-customer-title">Customer & Shop Details</div>
      <div class="modal-customer-grid">
        <div>
          <span class="field-lbl">Shop Name:</span>
          <span class="field-val">${escapeHtml(state.customerInfo.shopName) || '<em style="color:#d9534f">Missing</em>'}</span>
        </div>
        <div>
          <span class="field-lbl">Customer:</span>
          <span class="field-val">${escapeHtml(state.customerInfo.customerName) || '<em style="color:#d9534f">Missing</em>'}</span>
        </div>
        <div>
          <span class="field-lbl">Phone:</span>
          <span class="field-val">${escapeHtml(normalizePakistaniPhoneNumber(state.customerInfo.phone)) || '<em style="color:#d9534f">Missing</em>'}</span>
        </div>
        <div>
          <span class="field-lbl">Date:</span>
          <span class="field-val">${state.customerInfo.date || 'Today'}</span>
        </div>
        <div class="full-col">
          <span class="field-lbl">Address:</span>
          <span class="field-val">${escapeHtml(state.customerInfo.address) || '<em style="color:#d9534f">Missing</em>'}</span>
        </div>
      </div>
    </div>
  `;

  // Render categories grouped with line items
  const categoriesHtml = groupedSummary.map(group => {
    const itemsRows = group.items.map(item => `
      <div class="summary-line-item">
        <div class="item-meta">
          <div class="item-model-row">
            <span class="summary-model-badge">${escapeHtml(item.modelNumber)}</span>
            <span class="summary-item-name">${escapeHtml(item.productName)}</span>
          </div>
          <div class="summary-item-variant">${escapeHtml(item.variant || 'Standard')}</div>
          <div class="summary-rate-qty-meta">
            Rate: <strong>${formatCurrency(item.rate)}</strong> &times; QTY: <strong>${item.quantity}</strong>
          </div>
        </div>
        <div class="item-line-total">
          ${formatCurrency(item.lineTotal)}
        </div>
      </div>
    `).join('');

    return `
      <div class="summary-category-group">
        <div class="summary-category-header">
          <div class="cat-title-wrap">
            <span class="cat-badge-icon">${getCategoryIcon(group.category.icon || group.category.id)}</span>
            <span class="cat-title-text">${escapeHtml(group.category.name.toUpperCase())}</span>
          </div>
          <div class="cat-subtotals">
            <span>${group.totalUnits} Units</span>
            <span>&bull;</span>
            <span class="cat-subtotal-amt">${formatCurrency(group.totalAmount)}</span>
          </div>
        </div>
        <div class="summary-category-items">
          ${itemsRows}
        </div>
      </div>
    `;
  }).join('');

  modalBody.innerHTML = `
    ${customerInfoHtml}

    <div class="summary-groups-container">
      ${categoriesHtml}
    </div>

    <!-- Final Totals Card -->
    <div class="summary-grand-card">
      <div class="grand-row">
        <span class="grand-label">TOTAL ITEMS:</span>
        <span class="grand-units-val">${totalItems} Units</span>
      </div>
      <div class="grand-row main-total-row">
        <span class="grand-label">GRAND TOTAL:</span>
        <span class="grand-amount-val">${formatCurrency(grandTotal)}</span>
      </div>
    </div>

    <div class="modal-notice-box">
      💬 <strong>WhatsApp Order:</strong> If online, clicking <strong>SEND ORDER</strong> formats the invoice and opens WhatsApp for <strong>+92 329 4254904</strong>. If offline, the order is automatically saved locally.
    </div>
  `;
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
