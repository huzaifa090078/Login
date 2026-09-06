/**
 * Centralized Catalog Repository for LOGIN Order Form
 * 
 * Future-proof data access layer:
 * - Decouples data storage from UI components.
 * - Manages categories and products with local storage persistence.
 * - Supports adding, editing, reordering, searching, and toggling categories and products.
 * - Provides export/import and baseline reset functionality.
 */

import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/defaultCatalog.js';

const STORAGE_KEY = 'LOGIN_CUSTOM_CATALOG_V1';

let currentCategories = [];
let currentProducts = [];

const catalogListeners = new Set();

export function subscribeCatalog(listener) {
  catalogListeners.add(listener);
  return () => catalogListeners.delete(listener);
}

function notifyListeners(eventType, payload) {
  catalogListeners.forEach(fn => {
    try {
      fn(eventType, payload);
    } catch (e) {
      console.error('Error in catalog listener:', e);
    }
  });
}

/**
 * Helper to slugify strings into clean identifiers
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalize product to maintain 100% backwards compatibility
 */
const PRODUCT_STATUSES = ['in_stock', 'out_of_stock', 'coming_soon'];

function normalizeProductStatus(status) {
  return PRODUCT_STATUSES.includes(status) ? status : null;
}

export function getProductStatus(product) {
  if (product && normalizeProductStatus(product.status)) {
    return product.status;
  }
  if (product?.isComingSoon === true || product?.available === false || product?.active === false || product?.rate === null) {
    return 'coming_soon';
  }
  return 'in_stock';
}

export function isProductOrderable(product) {
  return getProductStatus(product) === 'in_stock';
}

function normalizeProduct(p, index = 0) {
  const explicitStatus = normalizeProductStatus(p.status);
  const status = explicitStatus || (
    p.isComingSoon === true || p.available === false || p.active === false || p.rate === null
      ? 'coming_soon'
      : 'in_stock'
  );
  const catId = p.categoryId || p.category || 'chargers';
  const pName = p.productName || p.name || 'Product';
  const model = p.modelNumber || 'Model';
  const variant = p.variant || '';
  const desc = p.description || variant || pName;
  const rateVal = (p.rate !== null && p.rate !== undefined && !isNaN(p.rate)) ? Number(p.rate) : null;

  return {
    id: p.id || `${catId}-${slugify(model)}-${slugify(variant) || index}`,
    categoryId: catId,
    category: catId, // Backwards compatibility alias
    modelNumber: model,
    productName: pName,
    name: pName, // Backwards compatibility alias
    variant: variant,
    description: desc,
    rate: rateVal,
    status,
    available: status === 'in_stock',
    active: status === 'in_stock', // Backwards compatibility alias
    isComingSoon: status === 'coming_soon',
    sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : (index + 1)
  };
}

/**
 * Normalize category
 */
function normalizeCategory(c, index = 0) {
  return {
    id: c.id || slugify(c.name) || `cat-${index + 1}`,
    name: c.name || 'Category',
    icon: c.icon || 'package',
    sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : (index + 1),
    active: c.active !== false
  };
}

/**
 * Initialize catalog from storage or baseline data
 */
export function initCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
        currentCategories = parsed.categories.map((c, i) => normalizeCategory(c, i));
        currentProducts = parsed.products.map((p, i) => normalizeProduct(p, i));
        return;
      }
    }
  } catch (err) {
    console.warn('Failed to parse catalog from localStorage, falling back to default:', err);
  }

  // Baseline fallback
  currentCategories = DEFAULT_CATEGORIES.map((c, i) => normalizeCategory(c, i));
  currentProducts = DEFAULT_PRODUCTS.map((p, i) => normalizeProduct(p, i));
}

// Automatically initialize on import
initCatalog();

function persistCatalog() {
  try {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      categories: currentCategories,
      products: currentProducts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save catalog to localStorage:', err);
  }
}

// ==========================================
// CATEGORY ACCESS & MUTATION
// ==========================================

export function getCategories(includeInactive = true) {
  const cats = [...currentCategories];
  cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return includeInactive ? cats : cats.filter(c => c.active !== false);
}

export function getActiveCategories() {
  return getCategories(false);
}

export function getCategoryById(categoryId) {
  return currentCategories.find(c => c.id === categoryId) || null;
}

export function addCategory(categoryData) {
  const name = (categoryData.name || '').trim();
  if (!name) {
    throw new Error('Category Name is required');
  }

  let baseId = categoryData.id ? slugify(categoryData.id) : slugify(name);
  if (!baseId) baseId = 'category';

  let uniqueId = baseId;
  let counter = 2;
  while (currentCategories.some(c => c.id === uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  const nextSortOrder = categoryData.sortOrder !== undefined && categoryData.sortOrder !== ''
    ? Number(categoryData.sortOrder)
    : (Math.max(0, ...currentCategories.map(c => c.sortOrder || 0)) + 1);

  const newCat = normalizeCategory({
    id: uniqueId,
    name: name,
    icon: categoryData.icon || 'package',
    sortOrder: nextSortOrder,
    active: categoryData.active !== false
  });

  currentCategories.push(newCat);
  persistCatalog();
  notifyListeners('category_added', newCat);
  return newCat;
}

export function updateCategory(categoryId, updates) {
  const index = currentCategories.findIndex(c => c.id === categoryId);
  if (index === -1) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  const existing = currentCategories[index];
  const updated = normalizeCategory({
    ...existing,
    ...updates,
    id: existing.id // Preserve stable unique identifier
  }, index);

  currentCategories[index] = updated;
  persistCatalog();
  notifyListeners('category_updated', updated);
  return updated;
}

export function deleteCategory(categoryId) {
  // Safety check: check if products reference this category
  const referencedCount = currentProducts.filter(p => p.categoryId === categoryId).length;
  if (referencedCount > 0) {
    // Soft disable instead of breaking references
    return updateCategory(categoryId, { active: false });
  }

  currentCategories = currentCategories.filter(c => c.id !== categoryId);
  persistCatalog();
  notifyListeners('category_deleted', { id: categoryId });
  return true;
}

// ==========================================
// PRODUCT ACCESS & MUTATION
// ==========================================

export function getAllProducts(includeUnavailable = true) {
  const prods = [...currentProducts];
  prods.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return includeUnavailable ? prods : prods.filter(isProductOrderable);
}

export function getActiveProducts() {
  return getAllProducts(false);
}

export function getProductsByCategory(categoryId, includeUnavailable = true) {
  if (!categoryId || categoryId === 'all') {
    return getAllProducts(includeUnavailable);
  }
  const filtered = currentProducts.filter(p => p.categoryId === categoryId || p.category === categoryId);
  filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return includeUnavailable ? filtered : filtered.filter(isProductOrderable);
}

export function getProductById(productId) {
  return currentProducts.find(p => p.id === productId) || null;
}

export function searchProducts(query, categoryFilter = null) {
  const q = (query || '').trim().toLowerCase();
  const allInCat = getProductsByCategory(categoryFilter, true);

  if (!q) {
    return allInCat;
  }

  const terms = q.split(/\s+/).filter(Boolean);

  return allInCat.filter(product => {
    const model = (product.modelNumber || '').toLowerCase();
    const name = (product.productName || product.name || '').toLowerCase();
    const variant = (product.variant || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const catName = (getCategoryById(product.categoryId)?.name || '').toLowerCase();

    const searchTarget = `${model} ${name} ${variant} ${desc} ${catName}`;
    return terms.every(term => searchTarget.includes(term));
  });
}

export function addProduct(productData) {
  const model = (productData.modelNumber || '').trim();
  const name = (productData.productName || productData.name || '').trim();
  const catId = productData.categoryId || productData.category;
  const status = normalizeProductStatus(productData.status)
    || (productData.available === false ? 'coming_soon' : 'in_stock');
  const rateVal = (productData.rate !== null && productData.rate !== undefined && productData.rate !== '')
    ? Number(productData.rate)
    : null;

  if (!catId) {
    throw new Error('Category is required');
  }
  if (!model) {
    throw new Error('Model Number is required');
  }
  if (!name) {
    throw new Error('Product Name is required');
  }
  if (status === 'in_stock' && (rateVal === null || isNaN(rateVal) || rateVal < 0)) {
    throw new Error('Wholesale Rate must be a valid number for In Stock products');
  }

  const variant = (productData.variant || '').trim();
  const desc = (productData.description || variant || name).trim();

  // Generate unique product ID: catId-model-variant
  let baseId = productData.id ? slugify(productData.id) : `${slugify(catId)}-${slugify(model)}${variant ? '-' + slugify(variant) : ''}`;
  if (!baseId) baseId = 'product';

  let uniqueId = baseId;
  let counter = 2;
  while (currentProducts.some(p => p.id === uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  const catProducts = currentProducts.filter(p => p.categoryId === catId);
  const nextSortOrder = productData.sortOrder !== undefined && productData.sortOrder !== ''
    ? Number(productData.sortOrder)
    : (catProducts.length + 1);

  const newProduct = normalizeProduct({
    id: uniqueId,
    categoryId: catId,
    modelNumber: model,
    productName: name,
    variant: variant,
    description: desc,
    rate: rateVal,
    status,
    sortOrder: nextSortOrder
  }, currentProducts.length);

  currentProducts.push(newProduct);
  persistCatalog();
  notifyListeners('product_added', newProduct);
  return newProduct;
}

export function updateProduct(productId, updates) {
  const index = currentProducts.findIndex(p => p.id === productId);
  if (index === -1) {
    throw new Error(`Product not found: ${productId}`);
  }

  const existing = currentProducts[index];
  const status = normalizeProductStatus(updates.status)
    || getProductStatus(existing);
  let rateVal = updates.rate !== undefined ? updates.rate : existing.rate;
  if (rateVal !== null && rateVal !== undefined && rateVal !== '') {
    rateVal = Number(rateVal);
  }

  if (status === 'in_stock' && (rateVal === null || rateVal === undefined || isNaN(rateVal) || rateVal < 0)) {
    throw new Error('Wholesale Rate must be a valid number for In Stock products');
  }

  const updated = normalizeProduct({
    ...existing,
    ...updates,
    id: existing.id, // ID remains permanently stable
    rate: rateVal,
    status
  }, index);

  currentProducts[index] = updated;
  persistCatalog();
  notifyListeners('product_updated', updated);
  return updated;
}

export function deleteProduct(productId) {
  // Soft disable is preferred
  return updateProduct(productId, { status: 'out_of_stock' });
}

// ==========================================
// IMPORT, EXPORT, & RESET
// ==========================================

export function exportCatalogJson() {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: currentCategories,
    products: currentProducts
  }, null, 2);
}

export function importCatalogJson(jsonStringOrObject) {
  const data = typeof jsonStringOrObject === 'string'
    ? JSON.parse(jsonStringOrObject)
    : jsonStringOrObject;

  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error('Invalid catalog format: must contain categories and products arrays');
  }

  currentCategories = data.categories.map((c, i) => normalizeCategory(c, i));
  currentProducts = data.products.map((p, i) => normalizeProduct(p, i));

  persistCatalog();
  notifyListeners('catalog_imported', { categories: currentCategories, products: currentProducts });
  return { categoriesCount: currentCategories.length, productsCount: currentProducts.length };
}

export function resetToDefaultCatalog() {
  localStorage.removeItem(STORAGE_KEY);
  initCatalog();
  notifyListeners('catalog_reset', { categories: currentCategories, products: currentProducts });
  return { categoriesCount: currentCategories.length, productsCount: currentProducts.length };
}
