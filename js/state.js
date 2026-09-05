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
  const dateStr = formatDateForWhatsApp(customer.date);

  let items = [];
  let totalItems = 0;
  let grandTotal = 0;

  if (customState === state) {
    const grouped = getOrderSummaryGrouped();
    items = grouped.flatMap(g => g.items);
    totalItems = getTotalItems();
    grandTotal = getGrandTotal();
  } else {
    const categories = getCategories();
    categories.forEach(cat => {
      Object.entries(customState.cart || {}).forEach(([productId, qty]) => {
        if (qty <= 0) return;
        const product = getProductById(productId);
        if (product && (product.categoryId === cat.id || product.category === cat.id)) {
          const lineTotal = product.rate * qty;
          items.push({
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
    });
  }

  const shopName = customer.shopName ? customer.shopName.trim() : '';
  const customerName = customer.customerName ? customer.customerName.trim() : '';
  const phone = customer.phone ? normalizePakistaniPhoneNumber(customer.phone) : '';
  const address = customer.address ? customer.address.trim() : '';

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
  const productBlocks = items.map(item => {
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
  msg += `Total Items: ${totalItems}\n`;
  msg += `Grand Total: ${formatCurrency(grandTotal)}\n`;
  msg += `${divider}\n`;
  msg += `Thank you for your order!`;

  return msg;
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

