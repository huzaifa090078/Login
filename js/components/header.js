/**
 * Header & Customer Information Component
 * 
 * Features:
 * - Brand logo
 * - Online / Offline status indicator
 * - Saved & Pending Orders quick button with counter
 * - Customer & Shop Details with auto-date
 */

import { getState, updateCustomerInfo, subscribe } from '../state.js';
import { getPendingOrdersCount, subscribeStorage } from '../storage.js';
import { openSavedOrdersModal } from './savedOrders.js';
import { openCatalogManagerModal } from './catalogManager.js';
import { ICONS } from '../icons.js';

export function renderHeader(container) {
  const state = getState();
  const { shopName, customerName, phone, address, date } = state.customerInfo;
  const pendingCount = getPendingOrdersCount();

  container.innerHTML = `
    <header class="app-header">
      <div class="brand-row">
        <div class="brand-logo">
          <span class="logo-box">LOGIN</span>
          <div class="logo-subtext">
            <span class="logo-title">SMART ACCESSORIES</span>
            <span class="logo-tagline">Wholesale Order System</span>
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="btn-header-orders btn-header-catalog" id="btn-header-open-catalog" aria-label="Open Catalog Manager" title="Catalog Manager">
            <span class="btn-header-icon">${ICONS.catalog}</span>
            <span>Catalog</span>
          </button>

          <button type="button" class="btn-header-orders" id="btn-header-open-orders" aria-label="View saved orders">
            <span class="btn-header-icon">${ICONS.orders}</span>
            <span>Orders</span>
            <span class="header-pending-pill" id="header-pending-count" style="${pendingCount > 0 ? '' : 'display: none;'}">
              ${pendingCount}
            </span>
          </button>
        </div>
      </div>
    </header>

    <section class="customer-info-section">
      <div class="section-header-compact">
        <h2>
          <span class="section-title-icon">${ICONS.customer}</span> Customer & Shop Details
        </h2>
      </div>

      <div class="customer-form-grid">
        <div class="form-group full-width">
          <label for="input-shop-name">Shop Name *</label>
          <input 
            type="text" 
            id="input-shop-name" 
            class="form-control" 
            placeholder="e.g. Al-Madina Mobile Zone" 
            value="${escapeHtml(shopName)}"
          />
        </div>

        <div class="form-group">
          <label for="input-customer-name">Customer Name *</label>
          <input 
            type="text" 
            id="input-customer-name" 
            class="form-control" 
            placeholder="e.g. Mohammad Ali" 
            value="${escapeHtml(customerName)}"
          />
        </div>

        <div class="form-group">
          <label for="input-customer-phone">Customer Number *</label>
          <input 
            type="tel" 
            inputmode="numeric"
            id="input-customer-phone" 
            class="form-control" 
            placeholder="Customer Number" 
            value="${escapeHtml(phone)}"
            aria-describedby="customer-phone-error"
          />
          <p class="field-inline-error" id="customer-phone-error" role="alert" aria-live="polite"></p>
        </div>

        <div class="form-group full-width">
          <label for="input-address">Address / Market Location *</label>
          <input 
            type="text" 
            id="input-address" 
            class="form-control" 
            placeholder="e.g. Shop #12, Hall Road, Lahore" 
            value="${escapeHtml(address)}"
          />
        </div>

        <div class="form-group full-width">
          <label for="input-order-date">Date</label>
          <input 
            type="date" 
            id="input-order-date" 
            class="form-control" 
            value="${date}"
          />
        </div>
      </div>
    </section>
  `;

  // Bind input listeners
  const shopNameInput = container.querySelector('#input-shop-name');
  const customerNameInput = container.querySelector('#input-customer-name');
  const customerPhoneInput = container.querySelector('#input-customer-phone');
  const dateInput = container.querySelector('#input-order-date');
  const addressInput = container.querySelector('#input-address');

  shopNameInput.addEventListener('input', (e) => {
    e.target.classList.remove('input-error');
    updateCustomerInfo('shopName', e.target.value);
  });
  customerNameInput.addEventListener('input', (e) => {
    e.target.classList.remove('input-error');
    updateCustomerInfo('customerName', e.target.value);
  });
  customerPhoneInput.addEventListener('input', (e) => {
    e.target.classList.remove('input-error');
    const error = container.querySelector('#customer-phone-error');
    if (error) {
      error.textContent = '';
      error.classList.remove('visible');
    }
    updateCustomerInfo('phone', e.target.value);
  });
  dateInput.addEventListener('change', (e) => updateCustomerInfo('date', e.target.value));
  addressInput.addEventListener('input', (e) => {
    e.target.classList.remove('input-error');
    updateCustomerInfo('address', e.target.value);
  });

  // Catalog Manager Button
  const openCatalogBtn = container.querySelector('#btn-header-open-catalog');
  if (openCatalogBtn) {
    openCatalogBtn.addEventListener('click', openCatalogManagerModal);
  }

  // Saved Orders Button
  const openOrdersBtn = container.querySelector('#btn-header-open-orders');
  if (openOrdersBtn) {
    openOrdersBtn.addEventListener('click', openSavedOrdersModal);
  }

  // Storage listener for pending orders count
  subscribeStorage(() => {
    const pill = document.getElementById('header-pending-count');
    if (pill) {
      const count = getPendingOrdersCount();
      pill.textContent = count;
      pill.style.display = count > 0 ? 'inline-block' : 'none';
    }
  });

  // State subscription to update customer fields when an order is loaded for edit
  subscribe((eventType) => {
    if (eventType === 'customer_updated' || eventType === 'order_loaded_for_edit') {
      const currentState = getState();
      if (shopNameInput && shopNameInput.value !== currentState.customerInfo.shopName) {
        shopNameInput.value = currentState.customerInfo.shopName || '';
      }
      if (customerNameInput && customerNameInput.value !== currentState.customerInfo.customerName) {
        customerNameInput.value = currentState.customerInfo.customerName || '';
      }
      if (customerPhoneInput && customerPhoneInput.value !== currentState.customerInfo.phone) {
        customerPhoneInput.value = currentState.customerInfo.phone || '';
      }
      if (addressInput && addressInput.value !== currentState.customerInfo.address) {
        addressInput.value = currentState.customerInfo.address || '';
      }
      if (dateInput && dateInput.value !== currentState.customerInfo.date) {
        dateInput.value = currentState.customerInfo.date || '';
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
