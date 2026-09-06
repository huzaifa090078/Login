/**
 * Catalog Management Component (Admin / Settings)
 * 
 * Lightweight, practical interface to:
 * - Add, edit, reorder, and toggle categories
 * - Add, edit, reorder, price, and toggle products
 * - Mark products as "In Stock", "Out of Stock", or "Coming Soon"
 * - Export and Import catalog JSON backups
 * - Reset to baseline default catalog
 */

import {
  getCategories,
  getAllProducts,
  getCategoryById,
  getProductById,
  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  exportCatalogJson,
  importCatalogJson,
  resetToDefaultCatalog,
  subscribeCatalog
} from '../catalogRepository.js';
import { formatCurrency } from '../state.js';
import { ICONS, SUPPORTED_CATEGORY_ICONS, getCategoryIcon } from '../icons.js';

let activeTab = 'products'; // 'products' | 'categories' | 'backup'
let selectedCategoryFilter = 'all';
let searchQuery = '';
let statusFilter = 'all'; // 'all' | 'in-stock' | 'out-of-stock' | 'coming-soon'

// Editing state
let editingCategoryId = null; // null for add mode
let editingProductId = null; // null for add mode

export function renderCatalogManagerModal(container) {
  container.innerHTML = `
    <div class="modal-backdrop modal-catalog-backdrop" id="catalog-manager-modal" aria-hidden="true">
      <div class="modal-card modal-card-catalog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title">CATALOG MANAGER</h3>
            <span class="modal-subtitle">Future-Proof Wholesale Product & Category System</span>
          </div>
          <button type="button" class="modal-close-btn" id="catalog-modal-close" aria-label="Close catalog manager">${ICONS.close}</button>
        </div>

        <div class="catalog-tabs-bar">
          <button type="button" class="catalog-tab-btn ${activeTab === 'products' ? 'active' : ''}" data-tab="products">
            ${ICONS.package} Products
          </button>
          <button type="button" class="catalog-tab-btn ${activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
            ${ICONS.catalog} Categories
          </button>
          <button type="button" class="catalog-tab-btn ${activeTab === 'backup' ? 'active' : ''}" data-tab="backup">
            ${ICONS.download} Backup / Sync
          </button>
        </div>

        <div class="modal-body catalog-modal-body" id="catalog-tab-content">
          <!-- Dynamic Tab Content Rendered Here -->
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="catalog-modal-dismiss">Back to Order Form</button>
        </div>
      </div>
    </div>

    <!-- Category Form Dialog Modal -->
    <div class="modal-backdrop modal-sub-dialog" id="category-form-modal" aria-hidden="true">
      <div class="modal-card modal-card-dialog">
        <div class="modal-header">
          <h4 class="modal-title" id="category-form-title">Add Category</h4>
          <button type="button" class="modal-close-btn" id="category-form-close">${ICONS.close}</button>
        </div>
        <form id="category-editor-form" class="editor-form modal-body">
          <div class="form-group">
            <label for="cat-form-name">Category Name *</label>
            <input type="text" id="cat-form-name" class="form-control" placeholder="e.g. Bluetooth Adapters" required />
          </div>
          <div class="form-group">
            <label for="cat-form-icon">Icon *</label>
            <div class="icon-selector-wrap">
              <select id="cat-form-icon" class="form-control">
                ${SUPPORTED_CATEGORY_ICONS.map(ic => `
                  <option value="${ic.id}">${ic.label}</option>
                `).join('')}
              </select>
              <div class="icon-preview-box" id="cat-icon-preview">${getCategoryIcon('charger')}</div>
            </div>
          </div>
          <div class="form-group">
            <label for="cat-form-sort">Display Order</label>
            <input type="number" id="cat-form-sort" class="form-control" min="1" step="1" placeholder="10" />
            <small class="form-hint">Controls order of category pills on mobile</small>
          </div>
          <div class="form-group-checkbox">
            <label>
              <input type="checkbox" id="cat-form-active" checked />
              <span>Active (Visible on order form)</span>
            </label>
          </div>
          <div id="cat-form-error" class="form-error-msg" style="display:none;"></div>
          <div class="form-actions-row">
            <button type="button" class="btn-secondary" id="cat-form-cancel">Cancel</button>
            <button type="submit" class="btn-send-order" id="cat-form-save">Save Category</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Product Form Dialog Modal -->
    <div class="modal-backdrop modal-sub-dialog" id="product-form-modal" aria-hidden="true">
      <div class="modal-card modal-card-dialog">
        <div class="modal-header">
          <h4 class="modal-title" id="product-form-title">Add Product</h4>
          <button type="button" class="modal-close-btn" id="product-form-close">${ICONS.close}</button>
        </div>
        <form id="product-editor-form" class="editor-form modal-body">
          <div class="form-group">
            <label for="prod-form-category">Category *</label>
            <select id="prod-form-category" class="form-control" required></select>
          </div>
          <div class="form-grid-2col">
            <div class="form-group">
              <label for="prod-form-model">Model Number *</label>
              <input type="text" id="prod-form-model" class="form-control" placeholder="e.g. L-950" required />
            </div>
            <div class="form-group">
              <label for="prod-form-variant">Variant</label>
              <input type="text" id="prod-form-variant" class="form-control" placeholder="e.g. USB / Type-C" />
            </div>
          </div>
          <div class="form-group">
            <label for="prod-form-name">Product Name *</label>
            <input type="text" id="prod-form-name" class="form-control" placeholder="e.g. FASTON Charger" required />
          </div>
          <div class="form-group">
            <label for="prod-form-desc">Description / Specs</label>
            <input type="text" id="prod-form-desc" class="form-control" placeholder="e.g. Fast Charging 3.0A" />
          </div>
          <div class="form-grid-2col">
            <div class="form-group">
              <label for="prod-form-rate">Wholesale Rate (PKR) *</label>
              <input type="number" id="prod-form-rate" class="form-control" min="0" step="1" placeholder="e.g. 599" />
              <small class="form-hint">Optional only when no price is available yet.</small>
            </div>
            <div class="form-group">
              <label for="prod-form-sort">Display Order</label>
              <input type="number" id="prod-form-sort" class="form-control" min="1" step="1" placeholder="Auto" />
            </div>
          </div>
          <div class="form-group">
            <label for="prod-form-status">Product Status *</label>
            <select id="prod-form-status" class="form-control">
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
            <small class="form-hint">Status controls ordering only; it never changes the wholesale rate.</small>
          </div>
          <div id="prod-form-error" class="form-error-msg" style="display:none;"></div>
          <div class="form-actions-row">
            <button type="button" class="btn-secondary" id="prod-form-cancel">Cancel</button>
            <button type="submit" class="btn-send-order" id="prod-form-save">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach core modal controls
  const modal = container.querySelector('#catalog-manager-modal');
  const closeBtn = container.querySelector('#catalog-modal-close');
  const dismissBtn = container.querySelector('#catalog-modal-dismiss');

  const hideModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  closeBtn?.addEventListener('click', hideModal);
  dismissBtn?.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // Tab switching
  const tabButtons = container.querySelectorAll('.catalog-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      renderCurrentTab(container);
    });
  });

  // Attach Sub-modal listeners (Category Editor & Product Editor)
  attachCategoryEditorListeners(container);
  attachProductEditorListeners(container);

  // Re-render when catalog changes
  subscribeCatalog(() => {
    if (modal.classList.contains('open')) {
      renderCurrentTab(container);
    }
  });

  // Initial render
  renderCurrentTab(container);
}

export function openCatalogManagerModal() {
  const modal = document.getElementById('catalog-manager-modal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const container = modal.closest('#catalog-manager-mount') || document.body;
    renderCurrentTab(container);
  }
}

export function closeCatalogManagerModal() {
  const modal = document.getElementById('catalog-manager-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function renderCurrentTab(container) {
  const tabContent = container.querySelector('#catalog-tab-content');
  if (!tabContent) return;

  if (activeTab === 'categories') {
    renderCategoriesTab(tabContent, container);
  } else if (activeTab === 'backup') {
    renderBackupTab(tabContent, container);
  } else {
    renderProductsTab(tabContent, container);
  }
}

// ==========================================
// TAB 1: CATEGORIES
// ==========================================

function renderCategoriesTab(contentEl, rootContainer) {
  const categories = getCategories(true); // Include inactive
  const allProducts = getAllProducts(true);

  contentEl.innerHTML = `
    <div class="catalog-tab-header">
      <div class="tab-header-left">
        <h4 class="tab-heading">Product Categories (${categories.length})</h4>
        <p class="tab-subheading">Manage wholesale categories and ordering pills</p>
      </div>
      <button type="button" class="btn-send-order btn-compact" id="btn-add-category">
        ${ICONS.plus} Add Category
      </button>
    </div>

    <div class="categories-admin-list">
      ${categories.map(cat => {
        const prodCount = allProducts.filter(p => p.categoryId === cat.id || p.category === cat.id).length;
        return `
          <div class="admin-category-card ${cat.active ? '' : 'is-inactive'}">
            <div class="cat-card-main">
              <span class="admin-cat-icon">${getCategoryIcon(cat.icon || cat.id)}</span>
              <div class="admin-cat-info">
                <div class="admin-cat-name-row">
                  <strong class="admin-cat-title">${escapeHtml(cat.name)}</strong>
                  <span class="admin-badge-slug">${escapeHtml(cat.id)}</span>
                </div>
                <div class="admin-cat-meta">
                  <span>Order: #${cat.sortOrder || 1}</span>
                  <span>&bull;</span>
                  <span>${prodCount} Products</span>
                </div>
              </div>
            </div>

            <div class="cat-card-actions">
              <button 
                type="button" 
                class="btn-status-toggle ${cat.active ? 'status-active' : 'status-inactive'}" 
                data-action="toggle-cat" 
                data-id="${cat.id}"
                title="${cat.active ? 'Click to disable' : 'Click to enable'}"
              >
                ${cat.active ? 'Active' : 'Disabled'}
              </button>
              <button type="button" class="btn-admin-icon" data-action="edit-cat" data-id="${cat.id}" title="Edit Category">
                ${ICONS.edit}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach Categories Tab Action Listeners
  contentEl.querySelector('#btn-add-category')?.addEventListener('click', () => {
    openCategoryEditor(rootContainer, null);
  });

  contentEl.querySelectorAll('[data-action="edit-cat"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-id');
      openCategoryEditor(rootContainer, catId);
    });
  });

  contentEl.querySelectorAll('[data-action="toggle-cat"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-id');
      const cat = getCategoryById(catId);
      if (cat) {
        updateCategory(catId, { active: !cat.active });
      }
    });
  });
}

// ==========================================
// TAB 2: PRODUCTS
// ==========================================

function renderProductsTab(contentEl, rootContainer) {
  const categories = getCategories(true);
  let products = getAllProducts(true);

  // Apply category filter
  if (selectedCategoryFilter !== 'all') {
    products = products.filter(p => p.categoryId === selectedCategoryFilter || p.category === selectedCategoryFilter);
  }

  // Apply product status filter
  if (statusFilter === 'in-stock') {
    products = products.filter(p => p.status === 'in_stock');
  } else if (statusFilter === 'out-of-stock') {
    products = products.filter(p => p.status === 'out_of_stock');
  } else if (statusFilter === 'coming-soon') {
    products = products.filter(p => p.status === 'coming_soon');
  }

  // Apply search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    products = products.filter(p => {
      const m = (p.modelNumber || '').toLowerCase();
      const n = (p.productName || p.name || '').toLowerCase();
      const v = (p.variant || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      return m.includes(q) || n.includes(q) || v.includes(q) || d.includes(q);
    });
  }

  contentEl.innerHTML = `
    <div class="catalog-tab-header">
      <div class="tab-header-left">
        <h4 class="tab-heading">Wholesale Products (${products.length})</h4>
        <p class="tab-subheading">Manage catalog items, pricing, and availability</p>
      </div>
      <button type="button" class="btn-send-order btn-compact" id="btn-add-product">
        ${ICONS.plus} Add Product
      </button>
    </div>

    <div class="products-filter-row">
      <div class="filter-input-wrap">
        <span class="search-icon">${ICONS.search}</span>
        <input 
          type="text" 
          id="admin-product-search" 
          class="search-input" 
          placeholder="Filter by model, name, variant..." 
          value="${escapeHtml(searchQuery)}"
        />
      </div>

      <div class="filter-selects-wrap">
        <select id="admin-category-filter" class="form-control select-compact">
          <option value="all" ${selectedCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
          ${categories.map(c => `
            <option value="${c.id}" ${selectedCategoryFilter === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>
          `).join('')}
        </select>

        <select id="admin-status-filter" class="form-control select-compact">
          <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="in-stock" ${statusFilter === 'in-stock' ? 'selected' : ''}>In Stock</option>
          <option value="out-of-stock" ${statusFilter === 'out-of-stock' ? 'selected' : ''}>Out of Stock</option>
          <option value="coming-soon" ${statusFilter === 'coming-soon' ? 'selected' : ''}>Coming Soon</option>
        </select>
      </div>
    </div>

    <div class="products-admin-list">
      ${products.length === 0 ? `
        <div class="admin-empty-state">
          <div class="empty-icon">${ICONS.searchEmpty}</div>
          <p>No products match the selected criteria.</p>
        </div>
      ` : products.map(prod => {
        const cat = getCategoryById(prod.categoryId || prod.category);
        const productStatus = prod.status || 'in_stock';
        const isInStock = productStatus === 'in_stock';
        const isOutOfStock = productStatus === 'out_of_stock';
        const statusLabel = isInStock ? 'In Stock' : (isOutOfStock ? 'Out of Stock' : 'Coming Soon');
        return `
          <div class="admin-product-card ${productStatus === 'coming_soon' ? 'is-coming-soon' : ''} ${isOutOfStock ? 'is-out-of-stock' : ''}">
            <div class="prod-card-top">
              <div class="prod-model-title-wrap">
                <span class="model-badge">${escapeHtml(prod.modelNumber)}</span>
                <span class="admin-cat-pill">${cat ? escapeHtml(cat.name) : (prod.categoryId || 'General')}</span>
              </div>
              <div class="prod-rate-wrap">
                ${prod.rate !== null && prod.rate !== undefined
                  ? `<span class="admin-prod-rate">${formatCurrency(prod.rate)}</span>` 
                  : `<span class="rate-coming-soon">${statusLabel.toUpperCase()}</span>`
                }
              </div>
            </div>

            <div class="prod-card-body">
              <div class="admin-prod-name">${escapeHtml(prod.productName || prod.name)}</div>
              ${prod.variant ? `<div class="admin-prod-variant">${escapeHtml(prod.variant)}</div>` : ''}
              ${prod.description && prod.description !== prod.variant ? `<div class="admin-prod-desc">${escapeHtml(prod.description)}</div>` : ''}
            </div>

            <div class="prod-card-footer">
              <div class="prod-id-tag">ID: <code>${escapeHtml(prod.id)}</code></div>
              <div class="prod-action-btns">
                <button 
                  type="button" 
                  class="btn-status-toggle ${isInStock ? 'status-active' : (isOutOfStock ? 'status-out-of-stock' : 'status-pending')}"
                  data-action="toggle-prod" 
                  data-id="${prod.id}"
                  title="Click to cycle product status"
                >
                  ${statusLabel}
                </button>
                <button type="button" class="btn-admin-icon" data-action="edit-prod" data-id="${prod.id}" title="Edit Product">
                  ${ICONS.edit}
                </button>
                <button type="button" class="btn-admin-icon btn-admin-delete" data-action="delete-prod" data-id="${prod.id}" title="Permanently Delete Product" aria-label="Permanently delete ${escapeHtml(prod.productName || prod.name)}">
                  ${ICONS.trash}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach search & filter listeners
  const searchInput = contentEl.querySelector('#admin-product-search');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProductsTab(contentEl, rootContainer);
  });

  const catSelect = contentEl.querySelector('#admin-category-filter');
  catSelect?.addEventListener('change', (e) => {
    selectedCategoryFilter = e.target.value;
    renderProductsTab(contentEl, rootContainer);
  });

  const statusSelect = contentEl.querySelector('#admin-status-filter');
  statusSelect?.addEventListener('change', (e) => {
    statusFilter = e.target.value;
    renderProductsTab(contentEl, rootContainer);
  });

  // Product Add / Edit listeners
  contentEl.querySelector('#btn-add-product')?.addEventListener('click', () => {
    openProductEditor(rootContainer, null);
  });

  contentEl.querySelectorAll('[data-action="edit-prod"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      openProductEditor(rootContainer, prodId);
    });
  });

  contentEl.querySelectorAll('[data-action="toggle-prod"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const prod = getProductById(prodId);
      if (prod) {
        const nextStatus = prod.status === 'in_stock'
          ? 'out_of_stock'
          : prod.status === 'out_of_stock'
            ? 'coming_soon'
            : 'in_stock';
        updateProduct(prodId, { status: nextStatus });
      }
    });
  });

  contentEl.querySelectorAll('[data-action="delete-prod"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const prod = getProductById(prodId);
      if (!prod) return;

      const productLabel = `${prod.modelNumber} — ${prod.productName || prod.name}`;
      const confirmed = window.confirm(
        `Permanently delete "${productLabel}"?\n\nThis product will be removed from the catalog and cannot be restored unless you import a backup.`
      );
      if (!confirmed) return;

      try {
        deleteProduct(prodId);
        renderProductsTab(contentEl, rootContainer);
      } catch (error) {
        window.alert(error.message || 'Product could not be deleted.');
      }
    });
  });
}

// ==========================================
// TAB 3: BACKUP / IMPORT / EXPORT
// ==========================================

function renderBackupTab(contentEl, rootContainer) {
  contentEl.innerHTML = `
    <div class="catalog-tab-header">
      <div class="tab-header-left">
        <h4 class="tab-heading">Catalog Backup & Portability</h4>
        <p class="tab-subheading">Export, import, or reset wholesale catalog data</p>
      </div>
    </div>

    <div class="backup-cards-grid">
      <!-- Export Card -->
      <div class="backup-card">
        <div class="backup-card-icon">${ICONS.download}</div>
        <div class="backup-card-info">
          <h5>Export Catalog (JSON)</h5>
          <p>Download complete catalog including all categories, products, and prices as a JSON backup.</p>
        </div>
        <button type="button" class="btn-send-order btn-compact" id="btn-export-catalog">
          Download Backup
        </button>
      </div>

      <!-- Import Card -->
      <div class="backup-card">
        <div class="backup-card-icon">${ICONS.upload}</div>
        <div class="backup-card-info">
          <h5>Import Catalog (JSON)</h5>
          <p>Restore or update catalog data from a previously exported JSON backup file.</p>
        </div>
        <input type="file" id="import-catalog-file" accept=".json" style="display:none;" />
        <button type="button" class="btn-secondary btn-compact" id="btn-trigger-import">
          Select JSON File
        </button>
      </div>

      <!-- Reset Card -->
      <div class="backup-card reset-card">
        <div class="backup-card-icon">${ICONS.trash}</div>
        <div class="backup-card-info">
          <h5>Reset to Baseline Catalog</h5>
          <p>Discard custom local edits and restore the official 113-product August 2026 catalog.</p>
        </div>
        <button type="button" class="btn-delete-order" id="btn-reset-catalog">
          Reset Catalog
        </button>
      </div>
    </div>

    <div id="backup-feedback-msg" class="backup-feedback-msg" style="display:none;"></div>
  `;

  const feedbackEl = contentEl.querySelector('#backup-feedback-msg');
  const showFeedback = (msg, isSuccess = true) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.className = `backup-feedback-msg ${isSuccess ? 'msg-success' : 'msg-error'}`;
    feedbackEl.style.display = 'block';
    setTimeout(() => {
      feedbackEl.style.display = 'none';
    }, 4000);
  };

  // Export
  contentEl.querySelector('#btn-export-catalog')?.addEventListener('click', () => {
    try {
      const json = exportCatalogJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `login_catalog_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('Catalog exported successfully!');
    } catch (err) {
      showFeedback('Failed to export catalog: ' + err.message, false);
    }
  });

  // Import
  const fileInput = contentEl.querySelector('#import-catalog-file');
  contentEl.querySelector('#btn-trigger-import')?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const res = importCatalogJson(event.target.result);
        showFeedback(`Successfully imported ${res.categoriesCount} categories and ${res.productsCount} products!`);
      } catch (err) {
        showFeedback('Import failed: ' + err.message, false);
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Reset
  contentEl.querySelector('#btn-reset-catalog')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the catalog to the original baseline? Any custom products will be removed.')) {
      resetToDefaultCatalog();
      showFeedback('Catalog reset to baseline default successfully!');
    }
  });
}

// ==========================================
// SUB-MODAL: CATEGORY EDITOR
// ==========================================

function attachCategoryEditorListeners(container) {
  const modal = container.querySelector('#category-form-modal');
  const form = container.querySelector('#category-editor-form');
  const closeBtn = container.querySelector('#category-form-close');
  const cancelBtn = container.querySelector('#cat-form-cancel');
  const iconSelect = container.querySelector('#cat-form-icon');
  const iconPreview = container.querySelector('#cat-icon-preview');

  const hideEditor = () => {
    modal?.classList.remove('open');
    editingCategoryId = null;
  };

  closeBtn?.addEventListener('click', hideEditor);
  cancelBtn?.addEventListener('click', hideEditor);

  iconSelect?.addEventListener('change', (e) => {
    if (iconPreview) {
      iconPreview.innerHTML = getCategoryIcon(e.target.value);
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = form.querySelector('#cat-form-error');
    if (errorEl) errorEl.style.display = 'none';

    try {
      const name = form.querySelector('#cat-form-name').value.trim();
      const icon = form.querySelector('#cat-form-icon').value;
      const sortVal = form.querySelector('#cat-form-sort').value;
      const isActive = form.querySelector('#cat-form-active').checked;

      if (!name) {
        throw new Error('Category Name is required');
      }

      if (editingCategoryId) {
        updateCategory(editingCategoryId, {
          name,
          icon,
          sortOrder: sortVal ? Number(sortVal) : undefined,
          active: isActive
        });
      } else {
        addCategory({
          name,
          icon,
          sortOrder: sortVal ? Number(sortVal) : undefined,
          active: isActive
        });
      }

      hideEditor();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    }
  });
}

function openCategoryEditor(container, categoryId = null) {
  const modal = container.querySelector('#category-form-modal');
  const form = container.querySelector('#category-editor-form');
  const titleEl = container.querySelector('#category-form-title');
  const iconPreview = container.querySelector('#cat-icon-preview');
  const errorEl = container.querySelector('#cat-form-error');

  if (!modal || !form) return;
  if (errorEl) errorEl.style.display = 'none';

  editingCategoryId = categoryId;

  if (categoryId) {
    const cat = getCategoryById(categoryId);
    if (!cat) return;

    titleEl.textContent = `Edit Category: ${cat.name}`;
    form.querySelector('#cat-form-name').value = cat.name;
    form.querySelector('#cat-form-icon').value = cat.icon || 'package';
    form.querySelector('#cat-form-sort').value = cat.sortOrder || 1;
    form.querySelector('#cat-form-active').checked = cat.active !== false;
    if (iconPreview) iconPreview.innerHTML = getCategoryIcon(cat.icon || 'package');
  } else {
    titleEl.textContent = 'Add Category';
    form.reset();
    form.querySelector('#cat-form-active').checked = true;
    const cats = getCategories(true);
    form.querySelector('#cat-form-sort').value = cats.length + 1;
    if (iconPreview) iconPreview.innerHTML = getCategoryIcon('charger');
  }

  modal.classList.add('open');
}

// ==========================================
// SUB-MODAL: PRODUCT EDITOR
// ==========================================

function attachProductEditorListeners(container) {
  const modal = container.querySelector('#product-form-modal');
  const form = container.querySelector('#product-editor-form');
  const closeBtn = container.querySelector('#product-form-close');
  const cancelBtn = container.querySelector('#prod-form-cancel');

  const hideEditor = () => {
    modal?.classList.remove('open');
    editingProductId = null;
  };

  closeBtn?.addEventListener('click', hideEditor);
  cancelBtn?.addEventListener('click', hideEditor);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = form.querySelector('#prod-form-error');
    if (errorEl) errorEl.style.display = 'none';

    try {
      const categoryId = form.querySelector('#prod-form-category').value;
      const modelNumber = form.querySelector('#prod-form-model').value.trim();
      const productName = form.querySelector('#prod-form-name').value.trim();
      const variant = form.querySelector('#prod-form-variant').value.trim();
      const description = form.querySelector('#prod-form-desc').value.trim();
      const rateVal = form.querySelector('#prod-form-rate').value;
      const status = form.querySelector('#prod-form-status').value;
      const sortVal = form.querySelector('#prod-form-sort').value;

      if (!categoryId) throw new Error('Category is required');
      if (!modelNumber) throw new Error('Model Number is required');
      if (!productName) throw new Error('Product Name is required');
      if (status === 'in_stock' && (!rateVal || isNaN(rateVal) || Number(rateVal) < 0)) {
        throw new Error('Wholesale Rate is required for In Stock products');
      }

      const payload = {
        categoryId,
        modelNumber,
        productName,
        variant,
        description: description || variant || productName,
        rate: rateVal === '' ? null : Number(rateVal),
        status,
        sortOrder: sortVal ? Number(sortVal) : undefined
      };

      if (editingProductId) {
        updateProduct(editingProductId, payload);
      } else {
        addProduct(payload);
      }

      hideEditor();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    }
  });
}

function openProductEditor(container, productId = null) {
  const modal = container.querySelector('#product-form-modal');
  const form = container.querySelector('#product-editor-form');
  const titleEl = container.querySelector('#product-form-title');
  const catSelect = container.querySelector('#prod-form-category');
  const errorEl = container.querySelector('#prod-form-error');

  if (!modal || !form) return;
  if (errorEl) errorEl.style.display = 'none';

  editingProductId = productId;

  // Populate categories dropdown
  const categories = getCategories(true);
  catSelect.innerHTML = categories.map(c => `
    <option value="${c.id}">${escapeHtml(c.name)}</option>
  `).join('');

  if (productId) {
    const prod = getProductById(productId);
    if (!prod) return;

    titleEl.textContent = `Edit Product: ${prod.modelNumber}`;
    catSelect.value = prod.categoryId || prod.category;
    form.querySelector('#prod-form-model').value = prod.modelNumber;
    form.querySelector('#prod-form-name').value = prod.productName || prod.name;
    form.querySelector('#prod-form-variant').value = prod.variant || '';
    form.querySelector('#prod-form-desc').value = prod.description || '';
    form.querySelector('#prod-form-rate').value = (prod.rate !== null && prod.rate !== undefined) ? prod.rate : '';
    form.querySelector('#prod-form-sort').value = prod.sortOrder || 1;
    form.querySelector('#prod-form-status').value = prod.status || 'in_stock';
  } else {
    titleEl.textContent = 'Add Product';
    form.reset();
    form.querySelector('#prod-form-status').value = 'in_stock';
    if (selectedCategoryFilter !== 'all') {
      catSelect.value = selectedCategoryFilter;
    }
  }

  modal.classList.add('open');
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
