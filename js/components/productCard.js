/**
 * Product Card Component
 * 
 * Supports:
 * - Model Number
 * - Product Name
 * - Description / Variant (prominent for duplicate model distinction)
 * - Wholesale Rate (PKR) or availability status indicator
 * - Quantity controls [-] [0] [+] (disabled when not In Stock)
 */

import { getQuantity, incrementQuantity, decrementQuantity, setQuantity, formatCurrency } from '../state.js';
import { ICONS } from '../icons.js';

export function createProductCardElement(product) {
  const status = product.status || 'in_stock';
  const isInStock = status === 'in_stock';
  const isComingSoon = status === 'coming_soon';
  const isOutOfStock = status === 'out_of_stock';
  const isUnavailable = !isInStock;
  const quantity = isInStock ? getQuantity(product.id) : 0;
  const card = document.createElement('div');
  
  card.className = `product-card ${quantity > 0 ? 'has-quantity' : ''} ${isComingSoon ? 'coming-soon-card' : ''} ${isOutOfStock ? 'out-of-stock-card' : ''}`;
  card.id = `product-card-${product.id}`;

  const rateMarkup = isInStock
    ? `<div class="rate-value">${formatCurrency(product.rate)}</div>`
    : isOutOfStock
      ? `<div class="rate-out-of-stock">OUT OF STOCK</div>`
      : `<div class="rate-coming-soon">COMING SOON</div>`;

  const stepperMarkup = isUnavailable
    ? `<div class="stepper-unavailable"><span>${isOutOfStock ? 'Out of Stock' : 'Coming Soon'}</span></div>`
    : `
      <div class="qty-stepper">
        <button 
          type="button" 
          class="qty-btn btn-minus" 
          aria-label="Decrease quantity" 
          ${quantity === 0 ? 'disabled' : ''}
        >${ICONS.minus}</button>
        <input 
          type="number" 
          class="qty-input" 
          value="${quantity}" 
          min="0" 
          step="1" 
          aria-label="Quantity for ${escapeHtml(product.modelNumber)} - ${escapeHtml(product.productName || product.name)}"
        />
        <button 
          type="button" 
          class="qty-btn btn-plus" 
          aria-label="Increase quantity"
        >${ICONS.plus}</button>
      </div>
    `;

  card.innerHTML = `
    <div class="card-top-row">
      <span class="model-badge">${escapeHtml(product.modelNumber)}</span>
      <span class="category-mini-badge">${escapeHtml(formatCategoryName(product.categoryId || product.category))}</span>
    </div>

    <h3 class="product-name">${escapeHtml(product.productName || product.name)}</h3>
    
    <div class="product-variant-badge">
      <span class="variant-label">Variant:</span>
      <span class="variant-text">${escapeHtml(product.variant || 'Standard')}</span>
    </div>

    <div class="card-bottom-row">
      <div class="rate-container">
        <span class="rate-label">Wholesale Rate</span>
        ${rateMarkup}
      </div>

      ${stepperMarkup}
    </div>
  `;

  if (isInStock) {
    const minusBtn = card.querySelector('.btn-minus');
    const plusBtn = card.querySelector('.btn-plus');
    const input = card.querySelector('.qty-input');

    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      decrementQuantity(product.id);
    });

    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      incrementQuantity(product.id);
    });

    input.addEventListener('change', (e) => {
      setQuantity(product.id, e.target.value);
    });

    input.addEventListener('focus', (e) => {
      e.target.select();
    });
  }

  return card;
}

export function updateCardQuantity(cardElement, quantity) {
  if (!cardElement) return;
  const minusBtn = cardElement.querySelector('.btn-minus');
  const input = cardElement.querySelector('.qty-input');

  if (input) {
    input.value = quantity;
    input.classList.remove('qty-pop');
    void input.offsetWidth; // trigger reflow
    input.classList.add('qty-pop');
  }
  if (minusBtn) minusBtn.disabled = (quantity === 0);

  if (quantity > 0) {
    cardElement.classList.add('has-quantity');
  } else {
    cardElement.classList.remove('has-quantity');
  }
}

function formatCategoryName(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
