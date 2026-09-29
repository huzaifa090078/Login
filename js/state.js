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
  activeEditOrderId: null // orderId if editing an existing order
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
  if (eventType === 'product_deleted' && payload?.id) {
    delete state.cart[payload.id];
  }
  notify('catalog_updated', { eventType, payload });
});

export function getState() {
  return state;
}

export function updateCustomerInfo(field, value) {
  if (typeof field === 'object' && field !== null) {
    Object.entries(field).forEach(([k, v]) => {
      state.customerInfo[k] = v;
      notify('customer_updated', { field: k, value: v });
    });
  } else {
    state.customerInfo[field] = value;
    notify('customer_updated', { field, value });
  }
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
  
  // Rule: Only products explicitly marked In Stock can be selected in the order
  if (product && product.status !== 'in_stock') {
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
  if (product && product.status !== 'in_stock') {
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

export function clearCart() {
  const productIds = Object.keys(state.cart);
  state.cart = {};
  productIds.forEach(id => {
    notify('cart_updated', { productId: id, quantity: 0 });
  });
  notify('cart_cleared', {});
}

export function setActiveEditOrderId(orderId) {
  state.activeEditOrderId = orderId || null;
  notify('edit_order_changed', { orderId: state.activeEditOrderId });
}

export function getActiveEditOrderId() {
  return state.activeEditOrderId;
}

export function loadOrderIntoForm(order) {
  if (!order) return;

  state.customerInfo.shopName = order.shopName || '';
  state.customerInfo.customerName = order.customerName || '';
  state.customerInfo.phone = order.phone || '';
  state.customerInfo.address = order.address || '';
  state.customerInfo.date = order.date || getTodayISODate();

  // Clear existing cart and set new quantities
  const oldIds = Object.keys(state.cart);
  state.cart = {};
  oldIds.forEach(id => {
    notify('cart_updated', { productId: id, quantity: 0 });
  });

  (order.items || []).forEach(item => {
    const pId = item.productId;
    const qty = Number(item.quantity || 0);
    if (pId && qty > 0) {
      state.cart[pId] = qty;
      notify('cart_updated', { productId: pId, quantity: qty });
    }
  });

  state.activeEditOrderId = order.orderId;
  notify('customer_updated', { field: 'all', customerInfo: state.customerInfo });
  notify('order_loaded_for_edit', { order });
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

export const WHATSAPP_PHONE = '';

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

export function formatWhatsAppProductLine(item) {
  const model = item.modelNumber ? String(item.modelNumber).trim() : '';
  let productName = (item.productName || item.name || (item.product && (item.product.productName || item.product.name)) || '').trim();

  let modelItemName = '';
  if (model && productName) {
    if (productName.toLowerCase().startsWith(model.toLowerCase())) {
      modelItemName = productName;
    } else {
      modelItemName = `${model} ${productName}`;
    }
  } else {
    modelItemName = model || productName || item.description || item.product?.description || 'Product';
  }

  const variant = (item.variant || item.description || (item.product && (item.product.variant || item.product.description)) || '').trim();
  const qty = item.quantity || 0;
  const rate = (typeof item.rate === 'number') ? item.rate : (typeof item.product?.rate === 'number' ? item.product.rate : 0);
  const total = (typeof item.lineTotal === 'number') ? item.lineTotal : (rate * qty);

  const calcPart = `${qty}×${rate}=${total}`;

  if (variant) {
    return `${modelItemName} | ${variant} | ${calcPart}`;
  }
  return `${modelItemName} | ${calcPart}`;
}

export function formatWhatsAppProductBlock(item) {
  return formatWhatsAppProductLine(item);
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

  const customerLines = [];
  if (shopName) customerLines.push(`Shop Name: ${shopName}`);
  if (customerName) customerLines.push(`Customer Name: ${customerName}`);
  if (phone) customerLines.push(`Customer No.: ${phone}`);
  if (address) customerLines.push(`Address: ${address}`);

  const customerBlock = customerLines.length > 0
    ? ['*CUSTOMER DETAILS*', ...customerLines, '']
    : [];

  const categorySections = groupedItems.map(group => {
    const categoryName = (group.category?.name || group.category?.id || 'Other Items').toUpperCase();
    const emoji = getWhatsAppCategoryEmoji(group.category);
    const heading = emoji ? `*${emoji} ${categoryName}*` : `*${categoryName}*`;
    const itemLines = group.items.map(formatWhatsAppProductLine).join('\n');
    return `${heading}\n${itemLines}`;
  });

  const orderDetailsText = categorySections.join('\n\n');

  return [
    divider,
    '*LOGIN | WHOLESALE ORDER*',
    divider,
    '',
    '*DATE*',
    dateStr,
    '',
    ...customerBlock,
    divider,
    '*ORDER DETAILS*',
    '',
    orderDetailsText,
    '',
    divider,
    `*TOTAL* ${totalItems} Items | *${formatCurrency(grandTotal)}*`,
    divider,
    '*LOGIN WHOLESALE*',
    'Thank you for your order.'
  ].join('\n');
}


export function getWhatsAppUrl(customState = state, recipientPhone = '') {
  const message = generateWhatsAppMessage(customState);
  const phone = recipientPhone || '';
  if (phone) {
    const normalized = normalizePakistaniPhoneNumber(phone);
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function redirectToWhatsApp(message, recipientPhone = '') {
  const encodedMsg = encodeURIComponent(message);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    (typeof navigator !== 'undefined' && navigator.userAgent) || ''
  );

  if (recipientPhone) {
    const normalized = normalizePakistaniPhoneNumber(recipientPhone);
    const waUrl = `https://wa.me/${normalized}?text=${encodedMsg}`;
    if (isMobile) {
      window.location.href = waUrl;
    } else {
      const opened = window.open(waUrl, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = waUrl;
      }
    }
    return;
  }

  // Without specific recipient: allows sending to ANY contact via WhatsApp contact picker
  if (isMobile) {
    // 1. Direct native app deep link on mobile (launches WhatsApp contact picker instantly)
    window.location.href = `whatsapp://send?text=${encodedMsg}`;

    // 2. Fallback to web dispatch in case native scheme is not handled
    setTimeout(() => {
      window.location.href = `https://api.whatsapp.com/send?text=${encodedMsg}`;
    }, 1200);
  } else {
    // Desktop: Open WhatsApp Web / WhatsApp Desktop directly
    const waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
    const opened = window.open(waUrl, '_blank');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      window.location.href = waUrl;
    }
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0';
  }
  return 'Rs. ' + amount.toLocaleString('en-PK');
}

