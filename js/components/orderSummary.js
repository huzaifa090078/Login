/**
 * Order Summary, Actions & WhatsApp Dispatch Component (Offline-First)
 * 
 * Rules:
 * - Clear Items button with confirmation dialog ("Clear all selected items?" Cancel / Clear)
 * - Save Order: Saves permanently to local database, triggers complete backup, shows "Order Saved Successfully"
 * - Edit Order support: Updates in-place without duplicating
 * - Send Order: Opens WhatsApp sharing (no hardcoded phone number)
 * - Safe-area friendly & navigation stack integrated
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
  setQuantity,
  clearCart,
  updateCustomerInfo,
  getActiveEditOrderId,
  setActiveEditOrderId,
  redirectToWhatsApp
} from '../state.js';
import { saveOrder } from '../storage.js';
import { openSavedOrdersModal, showToastNotification } from './savedOrders.js';
import { ICONS, getCategoryIcon } from '../icons.js';
import { pushModalNavigation, popModalNavigation, handleBackAction } from '../navigation.js';

export function renderOrderSummary(container) {
  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();
  const activeOrderId = getActiveEditOrderId();

  container.innerHTML = `
    <!-- Sticky Bottom Bar -->
    <div class="bottom-order-bar" id="order-summary-bar">
      <!-- Edit Mode Banner -->
      <div class="bar-edit-banner" id="bar-edit-banner" style="${activeOrderId ? 'display: flex;' : 'display: none;'}">
        <span class="edit-banner-text" id="edit-banner-text">✏️ Editing: ${activeOrderId || ''}</span>
        <button type="button" class="btn-cancel-edit-mode" id="btn-cancel-edit-mode" title="Exit Edit Mode">Cancel</button>
      </div>

      <div class="bottom-bar-main-row">
        <!-- Metrics (clickable to open Order Summary Modal) -->
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

        <!-- Action Buttons: Clear Items, Save Order, Send Order -->
        <div class="bottom-bar-actions">
          <button 
            type="button" 
            class="btn-clear-items" 
            id="btn-clear-items"
            aria-label="Clear all selected items"
            title="Clear all selected items"
          >
            <span class="btn-act-icon">${ICONS.trash || ICONS.clear}</span>
            <span class="btn-clear-label">Clear Items</span>
          </button>

          <button 
            type="button" 
            class="btn-save-order" 
            id="btn-save-order"
            aria-label="Save Order"
            title="Save order to local storage"
          >
            <span class="btn-act-icon">${ICONS.save || ICONS.check}</span>
            <span id="btn-save-label">${activeOrderId ? 'UPDATE' : 'SAVE'}</span>
          </button>

          <button 
            type="button" 
            class="btn-send-order" 
            id="btn-send-order"
            aria-label="Send Order via WhatsApp"
            title="Send Order via WhatsApp"
          >
            <span>SEND</span>
            <span class="btn-wa-icon">${ICONS.whatsapp}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Clear Items Confirmation Modal -->
    <div class="modal-backdrop" id="clear-items-modal" aria-hidden="true">
      <div class="modal-card modal-card-confirm">
        <div class="modal-header header-confirm">
          <div class="modal-title-wrap">
            <h3 class="modal-title">Clear all selected items?</h3>
            <span class="modal-subtitle">Customer details will be preserved</span>
          </div>
          <button type="button" class="modal-close-btn" id="clear-modal-close" aria-label="Cancel">${ICONS.close}</button>
        </div>
        
        <div class="modal-body confirm-modal-body">
          <p class="confirm-message">This will reset all product quantities to 0. Your shop name and customer details will remain untouched.</p>
        </div>

        <div class="modal-footer confirm-modal-footer">
          <button type="button" class="btn-secondary" id="btn-cancel-clear">Cancel</button>
          <button type="button" class="btn-danger-confirm" id="btn-confirm-clear">Clear</button>
        </div>
      </div>
    </div>

    <!-- Order Summary Modal -->
    <div class="modal-backdrop" id="order-summary-modal" aria-hidden="true">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title">WHOLESALE ORDER SUMMARY</h3>
            <span class="modal-subtitle">Review items, save locally, or send via WhatsApp</span>
          </div>
          <button type="button" class="modal-close-btn" id="modal-close-btn" aria-label="Close summary">${ICONS.close}</button>
        </div>
        
        <div class="modal-body" id="modal-content-body">
          <!-- Dynamic category-grouped content injected on open -->
        </div>

        <div class="modal-footer modal-footer-summary">
          <button type="button" class="btn-secondary" id="modal-btn-dismiss">Back to Catalog</button>
          
          <button type="button" class="btn-clear-items btn-modal-clear" id="modal-btn-clear-items">
            <span>${ICONS.trash || ICONS.clear}</span>
            <span>Clear Items</span>
          </button>

          <button type="button" class="btn-save-order btn-modal-save" id="modal-btn-save-order">
            <span>${ICONS.save || ICONS.check}</span>
            <span>${activeOrderId ? 'UPDATE ORDER' : 'SAVE ORDER'}</span>
          </button>

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
          <p class="validation-intro">Cannot save or send order yet. The following details are required:</p>
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
          <button type="button" class="btn-secondary" id="btn-offline-view-pending">View Saved Orders</button>
          <button type="button" class="btn-primary-yellow" id="btn-offline-start-new">Start New Order</button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const sendOrderBtn = container.querySelector('#btn-send-order');
  const saveOrderBtn = container.querySelector('#btn-save-order');
  const clearItemsBtn = container.querySelector('#btn-clear-items');

  const viewSummaryMetrics = container.querySelector('#bar-view-summary');
  const summaryModal = container.querySelector('#order-summary-modal');
  const summaryCloseBtn = container.querySelector('#modal-close-btn');
  const summaryDismissBtn = container.querySelector('#modal-btn-dismiss');
  const modalSendBtn = container.querySelector('#modal-btn-confirm-order');
  const modalSaveBtn = container.querySelector('#modal-btn-save-order');
  const modalClearBtn = container.querySelector('#modal-btn-clear-items');

  const clearModal = container.querySelector('#clear-items-modal');
  const clearModalClose = container.querySelector('#clear-modal-close');
  const cancelClearBtn = container.querySelector('#btn-cancel-clear');
  const confirmClearBtn = container.querySelector('#btn-confirm-clear');

  const validationModal = container.querySelector('#validation-error-modal');
  const validationCloseBtn = container.querySelector('#validation-close-btn');
  const validationOkBtn = container.querySelector('#validation-ok-btn');

  const offlineModal = container.querySelector('#offline-saved-modal');
  const offlineCloseBtn = container.querySelector('#offline-modal-close');
  const offlineViewPendingBtn = container.querySelector('#btn-offline-view-pending');
  const offlineStartNewBtn = container.querySelector('#btn-offline-start-new');

  const cancelEditBtn = container.querySelector('#btn-cancel-edit-mode');

  // Modal open/close helpers
  const openSummaryModal = () => {
    populateModalContent(container);
    summaryModal.classList.add('open');
    summaryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    pushModalNavigation('order-summary-modal', ({ fromBack }) => {
      summaryModal.classList.remove('open');
      summaryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  };

  const closeSummaryModal = ({ fromBack = false } = {}) => {
    summaryModal.classList.remove('open');
    summaryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (!fromBack) {
      popModalNavigation('order-summary-modal');
    }
  };

  const openClearModal = () => {
    if (getTotalItems() <= 0) {
      showToastNotification('No items in order to clear');
      return;
    }
    clearModal.classList.add('open');
    clearModal.setAttribute('aria-hidden', 'false');
    pushModalNavigation('clear-items-modal', ({ fromBack }) => {
      clearModal.classList.remove('open');
      clearModal.setAttribute('aria-hidden', 'true');
    });
  };

  const closeClearModal = ({ fromBack = false } = {}) => {
    clearModal.classList.remove('open');
    clearModal.setAttribute('aria-hidden', 'true');
    if (!fromBack) {
      popModalNavigation('clear-items-modal');
    }
  };

  const showValidationErrors = (errors) => {
    const listEl = container.querySelector('#validation-error-list');
    listEl.innerHTML = errors.map(err => `<li><span>❌</span> ${escapeHtml(err)}</li>`).join('');
    
    validationModal.classList.add('open');
    validationModal.setAttribute('aria-hidden', 'false');

    pushModalNavigation('validation-error-modal', ({ fromBack }) => {
      validationModal.classList.remove('open');
      validationModal.setAttribute('aria-hidden', 'true');
    });

    highlightMissingCustomerFields();
  };

  const closeValidationModal = ({ fromBack = false } = {}) => {
    validationModal.classList.remove('open');
    validationModal.setAttribute('aria-hidden', 'true');
    if (!fromBack) {
      popModalNavigation('validation-error-modal');
    }
    
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
        <div class="offline-summary-row"><span>Customer Number:</span> <strong>${escapeHtml(savedOrder.phone || '-')}</strong></div>
        <div class="offline-summary-row"><span>Items:</span> <strong>${savedOrder.totalItems} Units</strong></div>
        <div class="offline-summary-row"><span>Grand Total:</span> <strong>${formatCurrency(savedOrder.grandTotal)}</strong></div>
      `;
    }

    offlineModal.classList.add('open');
    offlineModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    pushModalNavigation('offline-saved-modal', ({ fromBack }) => {
      offlineModal.classList.remove('open');
      offlineModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  };

  const closeOfflineModal = ({ fromBack = false } = {}) => {
    offlineModal.classList.remove('open');
    offlineModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (!fromBack) {
      popModalNavigation('offline-saved-modal');
    }
  };

  // Build current snapshot payload
  const buildCurrentOrderPayload = (status = 'Pending') => {
    const state = getState();
    const grouped = getOrderSummaryGrouped();
    const allItems = [];
    grouped.forEach(g => {
      g.items.forEach(i => allItems.push(i));
    });

    const activeOrderId = getActiveEditOrderId();
    return {
      orderId: activeOrderId || undefined,
      date: state.customerInfo.date || new Date().toISOString().split('T')[0],
      shopName: state.customerInfo.shopName || '',
      customerName: state.customerInfo.customerName || (state.customerInfo.shopName || 'Wholesale Order'),
      phone: normalizePakistaniPhoneNumber(state.customerInfo.phone) || '',
      address: state.customerInfo.address || '',
      items: allItems,
      totalItems: getTotalItems(),
      grandTotal: getGrandTotal(),
      status
    };
  };

  // Save Order Permanently
  const executeSaveOrder = () => {
    const totalItems = getTotalItems();
    if (totalItems <= 0) {
      closeSummaryModal();
      showToastNotification('Please select at least 1 item to save');
      return;
    }

    const orderPayload = buildCurrentOrderPayload('Pending');
    const wasEditing = Boolean(getActiveEditOrderId());
    
    // Save locally (updates in place if orderId exists, else inserts)
    saveOrder(orderPayload);

    if (wasEditing) {
      setActiveEditOrderId(null);
    }

    closeSummaryModal();
    showToastNotification('Order Saved Successfully');
    updateOrderSummary(container);
  };

  // Send Order Directly via WhatsApp
  const executeSendOrder = () => {
    const totalItems = getTotalItems();

    if (totalItems <= 0) {
      closeSummaryModal();
      showToastNotification('Please select at least 1 item to order');
      const categoryMount = document.getElementById('category-mount') || document.getElementById('product-list-mount');
      if (categoryMount) {
        categoryMount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const state = getState();
    const orderPayload = buildCurrentOrderPayload('Sent');
    const wasEditing = Boolean(getActiveEditOrderId());

    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Offline: Save locally with status 'Pending'
      orderPayload.status = 'Pending';
      const saved = saveOrder(orderPayload);
      if (wasEditing) setActiveEditOrderId(null);

      closeSummaryModal();
      showOfflineSavedDialog(saved);
      return;
    }

    // Online: Save with status 'Sent' and redirect directly to WhatsApp
    orderPayload.status = 'Sent';
    saveOrder(orderPayload);
    if (wasEditing) setActiveEditOrderId(null);

    closeSummaryModal();
    showToastNotification('Redirecting to WhatsApp...');
    updateOrderSummary(container);

    // Direct redirect to WhatsApp (allows choosing any contact in WhatsApp)
    const message = generateWhatsAppMessage(state);
    redirectToWhatsApp(message);
  };

  // Reset form
  const resetOrderForm = () => {
    clearCart();
    updateCustomerInfo('shopName', '');
    updateCustomerInfo('customerName', '');
    updateCustomerInfo('phone', '');
    updateCustomerInfo('address', '');
    setActiveEditOrderId(null);

    const shopEl = document.getElementById('input-shop-name');
    const custEl = document.getElementById('input-customer-name');
    const phoneEl = document.getElementById('input-customer-phone');
    const addrEl = document.getElementById('input-address');
    if (shopEl) shopEl.value = '';
    if (custEl) custEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (addrEl) addrEl.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateOrderSummary(container);
  };

  // Bind Listeners
  sendOrderBtn.addEventListener('click', executeSendOrder);
  saveOrderBtn.addEventListener('click', executeSaveOrder);
  clearItemsBtn.addEventListener('click', openClearModal);

  modalSendBtn.addEventListener('click', executeSendOrder);
  if (modalSaveBtn) modalSaveBtn.addEventListener('click', executeSaveOrder);
  if (modalClearBtn) modalClearBtn.addEventListener('click', openClearModal);

  // Clear confirmation handlers
  clearModalClose.addEventListener('click', () => { handleBackAction() || closeClearModal(); });
  cancelClearBtn.addEventListener('click', () => { handleBackAction() || closeClearModal(); });
  clearModal.addEventListener('click', (e) => {
    if (e.target === clearModal) handleBackAction() || closeClearModal();
  });

  confirmClearBtn.addEventListener('click', () => {
    clearCart();
    handleBackAction() || closeClearModal();
    closeSummaryModal();
    showToastNotification('All items cleared');
    updateOrderSummary(container);
  });

  // Cancel Edit Mode button
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      setActiveEditOrderId(null);
      updateOrderSummary(container);
      showToastNotification('Exited edit mode');
    });
  }

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

  summaryCloseBtn.addEventListener('click', () => { handleBackAction() || closeSummaryModal(); });
  summaryDismissBtn.addEventListener('click', () => { handleBackAction() || closeSummaryModal(); });
  summaryModal.addEventListener('click', (e) => {
    if (e.target === summaryModal) handleBackAction() || closeSummaryModal();
  });

  validationCloseBtn.addEventListener('click', () => { handleBackAction() || closeValidationModal(); });
  validationOkBtn.addEventListener('click', () => { handleBackAction() || closeValidationModal(); });
  validationModal.addEventListener('click', (e) => {
    if (e.target === validationModal) handleBackAction() || closeValidationModal();
  });

  offlineCloseBtn.addEventListener('click', () => { handleBackAction() || closeOfflineModal(); });
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
    const phoneError = document.getElementById('customer-phone-error');
    if (!state.customerInfo.phone || !state.customerInfo.phone.trim() || !isValidPakistaniPhoneNumber(state.customerInfo.phone)) {
      customerPhoneInput.classList.add('input-error');
      if (phoneError) {
        phoneError.textContent = !state.customerInfo.phone || !state.customerInfo.phone.trim()
          ? 'Customer Number is required.'
          : 'Enter a valid Pakistani mobile number (e.g. 03001234567).';
        phoneError.classList.add('visible');
      }
    } else {
      customerPhoneInput.classList.remove('input-error');
      if (phoneError) {
        phoneError.textContent = '';
        phoneError.classList.remove('visible');
      }
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
  const activeOrderId = getActiveEditOrderId();

  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();

  if (itemsCountEl) itemsCountEl.textContent = totalItems;
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  // Update Edit Mode banner
  const banner = container.querySelector('#bar-edit-banner');
  const bannerText = container.querySelector('#edit-banner-text');
  const saveLabel = container.querySelector('#btn-save-label');
  const modalSaveBtn = container.querySelector('#modal-btn-save-order');

  if (banner) {
    if (activeOrderId) {
      banner.style.display = 'flex';
      if (bannerText) bannerText.textContent = `✏️ Editing: ${activeOrderId}`;
      if (saveLabel) saveLabel.textContent = 'UPDATE';
      if (modalSaveBtn) modalSaveBtn.innerHTML = `<span>${ICONS.save || ICONS.check}</span><span>UPDATE ORDER</span>`;
    } else {
      banner.style.display = 'none';
      if (saveLabel) saveLabel.textContent = 'SAVE';
      if (modalSaveBtn) modalSaveBtn.innerHTML = `<span>${ICONS.save || ICONS.check}</span><span>SAVE ORDER</span>`;
    }
  }
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
          <span class="field-lbl">Customer Number:</span>
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
      💬 <strong>Order Management:</strong> Click <strong>SAVE ORDER</strong> to store permanently on this device, or <strong>SEND ORDER</strong> to dispatch via WhatsApp.
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
