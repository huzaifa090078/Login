/**
 * Main Application Entry Point
 * LOGIN Order Form - Mobile-First Field Sales App (Offline-First PWA)
 */

import { subscribe } from './state.js';
import { renderHeader } from './components/header.js';
import { renderSearchBar } from './components/searchBar.js';
import { renderCategoryNav } from './components/categoryNav.js';
import { renderProductList } from './components/productList.js';
import { renderOrderSummary, updateOrderSummary } from './components/orderSummary.js';
import { renderSavedOrdersModal } from './components/savedOrders.js';
import { renderCatalogManagerModal } from './components/catalogManager.js';
import { updateCardQuantity } from './components/productCard.js';
import { initNavigation } from './navigation.js';

function initApp() {
  const headerContainer = document.getElementById('header-mount');
  const searchContainer = document.getElementById('search-mount');
  const categoryContainer = document.getElementById('category-mount');
  const productListContainer = document.getElementById('product-list-mount');
  const summaryContainer = document.getElementById('summary-mount');
  const savedOrdersContainer = document.getElementById('saved-orders-mount');
  const catalogManagerContainer = document.getElementById('catalog-manager-mount');

  // Initialize navigation / back button handling
  initNavigation();

  // Initial Renders
  renderHeader(headerContainer);
  renderSearchBar(searchContainer);
  renderCategoryNav(categoryContainer);
  renderProductList(productListContainer);
  renderOrderSummary(summaryContainer);
  if (savedOrdersContainer) {
    renderSavedOrdersModal(savedOrdersContainer);
  }
  if (catalogManagerContainer) {
    renderCatalogManagerModal(catalogManagerContainer);
  }

  // Subscribe to reactive state updates
  subscribe((eventType, payload) => {
    switch (eventType) {
      case 'catalog_updated':
        renderCategoryNav(categoryContainer);
        renderProductList(productListContainer);
        updateOrderSummary(summaryContainer);
        break;

      case 'category_changed':
        renderCategoryNav(categoryContainer);
        renderProductList(productListContainer);
        break;

      case 'search_changed':
        renderCategoryNav(categoryContainer);
        renderProductList(productListContainer);
        break;

      case 'cart_updated': {
        const { productId, quantity } = payload;
        // Update specific card in DOM if visible
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement) {
          updateCardQuantity(cardElement, quantity);
        }
        // Update sticky bottom summary bar
        updateOrderSummary(summaryContainer);
        break;
      }

      case 'cart_cleared':
      case 'order_loaded_for_edit':
      case 'edit_order_changed':
        renderProductList(productListContainer);
        updateOrderSummary(summaryContainer);
        break;

      default:
        break;
    }
  });

  // Register PWA Service Worker for Offline-First Capability
  registerServiceWorker();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((reg) => {
          console.log('[PWA] ServiceWorker successfully registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
    });
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
