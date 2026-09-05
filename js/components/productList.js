/**
 * Product List Component
 * 
 * Handles:
 * - Normal category product rendering
 * - Search results grouped by category with prominent category titles
 * - Empty states & search reset
 */

import { getProductsByCategory, getCategories, searchProducts } from '../catalog-data.js';
import { getState, setSearchQuery } from '../state.js';
import { createProductCardElement } from './productCard.js';
import { getCategoryIcon, ICONS } from '../icons.js';

export function renderProductList(container) {
  const state = getState();
  const categories = getCategories();
  const searchQuery = (state.searchQuery || '').trim();
  const isSearching = searchQuery.length > 0;

  if (isSearching) {
    renderSearchResults(container, searchQuery, categories);
  } else if (state.selectedCategory) {
    renderCategoryProducts(container, state.selectedCategory, categories);
  } else {
    // Initial state or closed state: NO products shown
    container.innerHTML = '';
  }
}

function renderCategoryProducts(container, selectedCategoryId, categories) {
  const products = getProductsByCategory(selectedCategoryId);
  const currentCategory = categories.find(c => c.id === selectedCategoryId) || {
    id: 'all',
    name: 'Products'
  };

  container.innerHTML = `
    <section class="product-catalog-section product-catalog-enter" id="products-section">
      <div class="catalog-header-bar">
        <h2 class="catalog-category-title">
          <span class="catalog-header-icon">${getCategoryIcon(currentCategory.icon || currentCategory.id)}</span>
          <span>${escapeHtml(currentCategory.name.toUpperCase())}</span>
        </h2>
        <span class="catalog-items-count">${products.length} Items Available</span>
      </div>

      <div class="product-grid" id="product-cards-container"></div>
    </section>
  `;

  const cardsContainer = container.querySelector('#product-cards-container');

  if (products.length === 0) {
    cardsContainer.innerHTML = `
      <div class="empty-category-state">
        <div class="empty-icon">${ICONS.package}</div>
        <h4 class="empty-title">No Products in this Category</h4>
        <p class="empty-desc">Products will appear here once added to this category.</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const cardEl = createProductCardElement(product);
    cardsContainer.appendChild(cardEl);
  });
}

function renderSearchResults(container, searchQuery, categories) {
  const matchingProducts = searchProducts(searchQuery);

  container.innerHTML = `
    <section class="product-catalog-section search-results-section" id="products-section">
      <div class="catalog-header-bar">
        <h2 class="catalog-category-title">
          <span class="catalog-header-icon">${ICONS.search}</span>
          <span>SEARCH RESULTS</span>
        </h2>
        <span class="catalog-items-count">${matchingProducts.length} Match${matchingProducts.length === 1 ? '' : 'es'}</span>
      </div>

      <div class="search-active-banner">
        <span>Showing results for <strong>"${escapeHtml(searchQuery)}"</strong> across all categories</span>
        <button type="button" class="btn-text-clear" id="btn-clear-search-link">Clear Search</button>
      </div>

      <div id="search-groups-container"></div>
    </section>
  `;

  const clearBtn = container.querySelector('#btn-clear-search-link');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.value = '';
      setSearchQuery('');
    });
  }

  const groupsContainer = container.querySelector('#search-groups-container');

  if (matchingProducts.length === 0) {
    groupsContainer.innerHTML = `
      <div class="empty-category-state">
        <div class="empty-icon">${ICONS.searchEmpty}</div>
        <h4 class="empty-title">No Matching Products Found</h4>
        <p class="empty-desc">
          No wholesale items matched <strong>"${escapeHtml(searchQuery)}"</strong>.
          <br>Try searching a model number (e.g. <code>L-400</code>), name (e.g. <code>ELVO</code>), or variant (e.g. <code>Type-C</code>).
        </p>
      </div>
    `;
    return;
  }

  // Group matching products by category in official order
  categories.forEach(category => {
    const categoryMatches = matchingProducts.filter(p => p.categoryId === category.id || p.category === category.id);
    if (categoryMatches.length > 0) {
      const catGroupEl = document.createElement('div');
      catGroupEl.className = 'search-category-group';
      
      catGroupEl.innerHTML = `
        <div class="search-category-header">
          <div class="search-cat-title">
            <span class="search-cat-icon">${getCategoryIcon(category.icon || category.id)}</span>
            <span class="search-cat-name">${escapeHtml(category.name.toUpperCase())}</span>
          </div>
          <span class="search-cat-count">${categoryMatches.length} product${categoryMatches.length === 1 ? '' : 's'}</span>
        </div>
        <div class="product-grid search-group-grid"></div>
      `;

      const grid = catGroupEl.querySelector('.search-group-grid');
      categoryMatches.forEach(product => {
        const cardEl = createProductCardElement(product);
        grid.appendChild(cardEl);
      });

      groupsContainer.appendChild(catGroupEl);
    }
  });
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
