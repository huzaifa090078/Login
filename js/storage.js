/**
 * Local Storage Module for Offline-First Orders
 * 
 * Manages locally saved orders with persistent schema:
 * - orderId
 * - createdAt (ISO timestamp)
 * - date (e.g. 2026-09-05)
 * - shopName
 * - customerName
 * - address
 * - items: [{ productId, modelNumber, productName, variant, rate, quantity, lineTotal }]
 * - totalItems (total units)
 * - grandTotal
 * - status: 'Pending' | 'Sent'
 */

const STORAGE_KEY = 'LOGIN_SAVED_ORDERS_V1';

const storageListeners = new Set();

export function subscribeStorage(callback) {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
}

function notifyStorageListeners() {
  const orders = getSavedOrders();
  storageListeners.forEach(fn => fn(orders));
}

export function getSavedOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read saved orders from localStorage:', err);
    return [];
  }
}

const BACKUP_STORAGE_KEY = 'LOGIN_APP_BACKUP_LATEST';
const BACKUP_HISTORY_KEY = 'LOGIN_APP_BACKUPS_HISTORY';

export function createAutomaticBackup() {
  try {
    const orders = getSavedOrders();
    let customCatalog = null;
    try {
      const rawCatalog = localStorage.getItem('LOGIN_CUSTOM_CATALOG_V1');
      if (rawCatalog) customCatalog = JSON.parse(rawCatalog);
    } catch (e) {
      console.warn('Catalog read during backup:', e);
    }

    const backupPayload = {
      backupId: `BKP-${Date.now()}`,
      backupVersion: '1.0',
      timestamp: new Date().toISOString(),
      appName: 'LOGIN SMART ACCESSORIES - Wholesale Order System',
      totalOrders: orders.length,
      data: {
        orders,
        customCatalog
      }
    };

    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupPayload));

    // Maintain rolling history of recent backups
    try {
      const rawHistory = localStorage.getItem(BACKUP_HISTORY_KEY);
      let history = rawHistory ? JSON.parse(rawHistory) : [];
      if (!Array.isArray(history)) history = [];
      history.unshift({
        backupId: backupPayload.backupId,
        timestamp: backupPayload.timestamp,
        totalOrders: orders.length,
        summary: `${orders.length} orders backed up on ${new Date().toLocaleDateString()}`
      });
      if (history.length > 10) history = history.slice(0, 10);
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
    } catch (hErr) {
      // Non-critical history update error
    }

    return backupPayload;
  } catch (err) {
    console.error('Error creating automatic backup:', err);
    return null;
  }
}

export function getLatestBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveOrder(orderData) {
  const orders = getSavedOrders();
  
  // Format unique order ID if not provided
  const todayCompact = (orderData.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = orderData.orderId || `ORD-${todayCompact}-${randomSuffix}`;

  const orderRecord = {
    orderId,
    createdAt: orderData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: orderData.date || new Date().toISOString().split('T')[0],
    shopName: (orderData.shopName || '').trim(),
    customerName: (orderData.customerName || '').trim(),
    phone: (orderData.phone || '').trim(),
    address: (orderData.address || '').trim(),
    items: (orderData.items || []).map(item => {
      const rateVal = Number(item.rate !== undefined && item.rate !== null ? item.rate : (item.product?.rate || 0));
      const qtyVal = Number(item.quantity || 0);
      return {
        productId: item.productId || item.product?.id,
        modelNumber: item.modelNumber || item.product?.modelNumber || '',
        productName: item.productName || item.product?.productName || item.name || item.product?.name || '',
        variant: item.variant || item.product?.variant || item.description || 'Standard',
        description: item.description || item.variant || '',
        rate: rateVal,
        priceAtOrderTime: item.priceAtOrderTime || rateVal,
        quantity: qtyVal,
        lineTotal: Number(item.lineTotal !== undefined && item.lineTotal !== null ? item.lineTotal : (rateVal * qtyVal))
      };
    }),
    totalItems: Number(orderData.totalItems || 0),
    grandTotal: Number(orderData.grandTotal || 0),
    status: orderData.status || 'Pending' // 'Pending' | 'Sent'
  };

  const existingIndex = orders.findIndex(o => o.orderId === orderId);
  if (existingIndex !== -1) {
    // Update existing order without creating duplicate
    orderRecord.createdAt = orders[existingIndex].createdAt || orderRecord.createdAt;
    orders[existingIndex] = orderRecord;
  } else {
    // New order
    orders.unshift(orderRecord); // Most recent first
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    notifyStorageListeners();
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }

  // Requirement 9: Trigger automatic complete backup on save
  try {
    createAutomaticBackup();
  } catch (backupErr) {
    console.warn('Automatic backup failed (non-critical):', backupErr);
  }

  return orderRecord;
}

export function getOrderById(orderId) {
  const orders = getSavedOrders();
  return orders.find(o => o.orderId === orderId) || null;
}

export function updateOrderStatus(orderId, status) {
  const orders = getSavedOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      notifyStorageListeners();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
    return orders[index];
  }
  return null;
}

export function deleteOrder(orderId) {
  let orders = getSavedOrders();
  orders = orders.filter(o => o.orderId !== orderId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    notifyStorageListeners();
  } catch (err) {
    console.error('Failed to delete order:', err);
  }
}

export function getPendingOrdersCount() {
  const orders = getSavedOrders();
  return orders.filter(o => o.status === 'Pending').length;
}

export function clearAllOrders() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyStorageListeners();
  } catch (err) {
    console.error('Failed to clear orders:', err);
  }
}
