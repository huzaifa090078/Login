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

export function saveOrder(orderData) {
  const orders = getSavedOrders();
  
  // Format unique order ID
  const todayCompact = (orderData.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = orderData.orderId || `ORD-${todayCompact}-${randomSuffix}`;

  const newOrder = {
    orderId,
    createdAt: orderData.createdAt || new Date().toISOString(),
    date: orderData.date,
    shopName: (orderData.shopName || '').trim(),
    customerName: (orderData.customerName || '').trim(),
    phone: (orderData.phone || '').trim(),
    address: (orderData.address || '').trim(),
    items: (orderData.items || []).map(item => {
      const rateVal = Number(item.rate || item.product?.rate || 0);
      const qtyVal = Number(item.quantity || 0);
      return {
        productId: item.productId || item.product?.id,
        modelNumber: item.modelNumber || item.product?.modelNumber,
        productName: item.productName || item.product?.productName || item.name || item.product?.name,
        variant: item.variant || item.product?.variant || 'Standard',
        rate: rateVal,
        priceAtOrderTime: item.priceAtOrderTime || rateVal,
        quantity: qtyVal,
        lineTotal: Number(item.lineTotal || (rateVal * qtyVal) || 0)
      };
    }),
    totalItems: Number(orderData.totalItems || 0),
    grandTotal: Number(orderData.grandTotal || 0),
    status: orderData.status || 'Pending' // 'Pending' | 'Sent'
  };

  orders.unshift(newOrder); // Most recent first
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    notifyStorageListeners();
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }

  return newOrder;
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
