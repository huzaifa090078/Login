/**
 * Central State Management for LOGIN Order Form
 */

import { getProductById, getCategories } from './catalog-data.js';
import { subscribeCatalog } from './catalogRepository.js';

function getTodayISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const state = {
  customerInfo: {
    shopName: '',
    customerName: '',
    phone: '',
    address: '',
    date: getTodayISODate(),
  },
  selectedCategory: null, // Initial state: ALL categories closed
  searchQuery: '',
  cart: {}, // { [productId]: quantity }
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(eventType, payload) {
  listeners.forEach(fn => fn(eventType, payload, state));
}

// Forward catalog changes to state listeners
subscribeCatalog((eventType, payload) => {
  notify('catalog_updated', { eventType, payload });
});

export function getState() {
  return state;
}

export function updateCustomerInfo(field, value) {
  state.customerInfo[field] = value;
  notify('customer_updated', { field, value });
}

export function setSelectedCategory(categoryId) {
  // Toggle: if clicking the active category, deselect it (close it); otherwise open new category
  state.selectedCategory = state.selectedCategory === categoryId ? null : categoryId;
  notify('category_changed', { categoryId: state.selectedCategory });
}

export function setSearchQuery(query) {
  state.searchQuery = query || '';
  notify('search_changed', { query: state.searchQuery });
}

export function getSearchQuery() {
  return state.searchQuery;
}

export function getQuantity(productId) {
  return state.cart[productId] || 0;
}

export function setQuantity(productId, quantity) {
  const product = getProductById(productId);
  
  // Rule: Products marked "COMING SOON" or unavailable must NOT be selectable in the order
  if (product && (product.available === false || product.active === false || product.isComingSoon || product.rate === null || typeof product.rate !== 'number')) {
    return;
  }

  const qty = Math.max(0, parseInt(quantity, 10) || 0);
  if (qty === 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = qty;
  }
  notify('cart_updated', { productId, quantity: qty });
}

export function incrementQuantity(productId) {
  const product = getProductById(productId);
  if (product && (product.available === false || product.active === false || product.isComingSoon || product.rate === null)) {
    return;
  }
  const current = getQuantity(productId);
  setQuantity(productId, current + 1);
}

export function decrementQuantity(productId) {
  const current = getQuantity(productId);
  if (current > 0) {
    setQuantity(productId, current - 1);
  }
}

/**
 * Total Items means total units across all products, NOT number of unique products.
 */
export function getTotalItems() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Grand Total: sum of all selected line totals (rate * quantity)
 */
export function getGrandTotal() {
  return Object.entries(state.cart).reduce((sum, [productId, qty]) => {
    const product = getProductById(productId);
    if (product && typeof product.rate === 'number') {
      return sum + (product.rate * qty);
    }
    return sum;
  }, 0);
}

/**
 * Order summary grouped by category.
 * Only returns categories that contain selected products (quantity > 0).
 * Duplicate model numbers are preserved as distinct items.
 */
export function getOrderSummaryGrouped() {
  const categories = getCategories();
  const grouped = [];

  categories.forEach(cat => {
    const itemsInCat = [];

    Object.entries(state.cart).forEach(([productId, qty]) => {
      if (qty <= 0) return;
      const product = getProductById(productId);
      if (product && (product.categoryId === cat.id || product.category === cat.id)) {
        itemsInCat.push({
          productId: product.id,
          modelNumber: product.modelNumber,
          productName: product.productName || product.name,
          variant: product.variant,
          rate: product.rate,
          quantity: qty,
          lineTotal: product.rate * qty,
          product
        });
      }
    });

    if (itemsInCat.length > 0) {
      const categoryTotalUnits = itemsInCat.reduce((sum, i) => sum + i.quantity, 0);
      const categoryTotalAmount = itemsInCat.reduce((sum, i) => sum + i.lineTotal, 0);

      grouped.push({
        category: cat,
        items: itemsInCat,
        totalUnits: categoryTotalUnits,
        totalAmount: categoryTotalAmount
      });
    }
  });

  return grouped;
}

export const WHATSAPP_PHONE = '923294254904';

export function formatDateForWhatsApp(isoDate) {
  if (!isoDate) {
    const today = new Date();
    isoDate = today.toISOString().split('T')[0];
  }
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2].padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[monthIndex] || parts[1];
    return `${day}-${monthStr}-${year}`;
  }
  return isoDate;
}

export function formatInvoiceDateForWhatsApp(isoDate) {
  const formatted = formatDateForWhatsApp(isoDate);
  return formatted.replace(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/, '$1 $2 $3');
}

export function normalizePakistaniPhoneNumber(input) {
  if (!input || typeof input !== 'string') return '';
  let cleaned = input.trim().replace(/[\s\-_().]/g, '');
  if (cleaned.startsWith('+92')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0092')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('92') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

export function isValidPakistaniPhoneNumber(input) {
  if (!input) return false;
  const normalized = normalizePakistaniPhoneNumber(input);
  return /^03\d{9}$/.test(normalized);
}

const WHATSAPP_CATEGORY_EMOJIS = {
  chargers: '🔌',
  'data-cables': '🔌',
  handsfree: '🎧',
  'power-banks': '🔋',
  'smart-watches': '⌚',
  tws: '🎵',
  'neckband-headphones': '🎧',
  speakers: '🔊',
  batteries: '🔋'
};

export function getWhatsAppCategoryEmoji(category) {
  const categoryId = typeof category === 'string' ? category : category?.id;
  return WHATSAPP_CATEGORY_EMOJIS[categoryId] || '📦';
}

export function formatWhatsAppProductLabel(item) {
  const model = item.modelNumber ? String(item.modelNumber).trim() : '';
  const productName = (item.productName || item.name || '').trim();
  const baseLabel = [model, productName].filter(Boolean).join(' ').trim()
    || item.description
    || model
    || 'Product';
  const variant = item.variant ? String(item.variant).trim() : '';

  if (!variant || baseLabel.toLowerCase().includes(variant.toLowerCase())) {
    return baseLabel;
  }
  return `${baseLabel} — ${variant}`;
}

export function formatWhatsAppProductBlock(item) {
  return `${formatWhatsAppProductLabel(item)}\n${formatCurrency(item.rate)} × ${item.quantity} = ${formatCurrency(item.lineTotal)}`;
}

export function validateOrder(customState = state) {
  const errors = [];
  const customer = customState.customerInfo;

  if (!customer.shopName || !customer.shopName.trim()) {
    errors.push('Shop Name is required');
  }
  if (!customer.customerName || !customer.customerName.trim()) {
    errors.push('Customer Name is required');
  }
  if (!customer.phone || !customer.phone.trim()) {
    errors.push('Phone Number is required');
  } else if (!isValidPakistaniPhoneNumber(customer.phone)) {
    errors.push('Enter a valid Pakistani mobile number (e.g. 03001234567)');
  }
  if (!customer.address || !customer.address.trim()) {
    errors.push('Address is required');
  }
  
  const totalItems = (customState === state)
    ? getTotalItems()
    : Object.values(customState.cart || {}).reduce((sum, q) => sum + q, 0);

  if (totalItems <= 0) {
    errors.push('At least one product must have quantity > 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function generateWhatsAppMessage(customState = state) {
  const divider = '━━━━━━━━━━━━━━━━━━━━';
  const customer = customState.customerInfo;
  const dateStr = formatInvoiceDateForWhatsApp(customer.date);

  let groupedItems = [];
  let totalItems = 0;
  let grandTotal = 0;

  if (customState === state) {
    groupedItems = getOrderSummaryGrouped();
    totalItems = getTotalItems();
    grandTotal = getGrandTotal();
  } else {
    const categories = getCategories();
    categories.forEach(cat => {
      const categoryItems = [];
      Object.entries(customState.cart || {}).forEach(([productId, qty]) => {
        if (qty <= 0) return;
        const product = getProductById(productId);
        if (product && (product.categoryId === cat.id || product.category === cat.id)) {
          const lineTotal = product.rate * qty;
          categoryItems.push({
            productId: product.id,
            modelNumber: product.modelNumber,
            productName: product.productName || product.name,
            variant: product.variant,
            rate: product.rate,
            quantity: qty,
            lineTotal,
            product
          });
          totalItems += qty;
          grandTotal += lineTotal;
        }
      });
      if (categoryItems.length > 0) {
        groupedItems.push({ category: cat, items: categoryItems });
      }
    });
  }

  const shopName = customer.shopName ? customer.shopName.trim() : '';
  const customerName = customer.customerName ? customer.customerName.trim() : '';
  const phone = customer.phone ? normalizePakistaniPhoneNumber(customer.phone) : '';
  const address = customer.address ? customer.address.trim() : '';

  const categorySections = groupedItems.map(group => {
    const categoryName = (group.category?.name || group.category?.id || 'Other Items').toUpperCase();
    const productBlocks = group.items.map(formatWhatsAppProductBlock);
    return `*${getWhatsAppCategoryEmoji(group.category)} ${categoryName}*\n\n${productBlocks.join('\n\n')}`;
  });

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
    categorySections.join('\n\n'),
    '',
    divider,
    '*ORDER TOTAL*',
    `Total Items: ${totalItems}`,
    `*Grand Total: ${formatCurrency(grandTotal)}*`,
    '',
    divider,
    '*LOGIN WHOLESALE*',
    'Thank you for your order.'
  ].join('\n');
}


export function getWhatsAppUrl(customState = state) {
  const message = generateWhatsAppMessage(customState);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0';
  }
  return 'Rs. ' + amount.toLocaleString('en-PK');
}

