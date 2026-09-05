/**
 * Category Navigation Component (Compact 3-Column Capsule / Pill Selector)
 * 
 * Renders modern, compact pill-shaped category buttons in a 3-column mobile layout.
 * Light-themed, clean, and highly responsive.
 * 
 * Layout:
 * Row 1: [ ⚡ Chargers ]              [ 🔌 Data Cables ]  [ 🎧 Handsfree ]
 * Row 2: [ 🔋 Power Banks ]           [ ⌚ Smart Watches ] [ 🎵 TWS ]
 * Row 3: [ 🎧 Neckband & Headphones ] [ 🔊 Speakers ]     [ 🔋 Batteries ]
 */

import { getActiveCategories } from '../catalog-data.js';
import { getState, setSelectedCategory, setSearchQuery } from '../state.js';
import { getCategoryIcon } from '../icons.js';

export function renderCategoryNav(container) {
  const categories = getActiveCategories();
  const state = getState();
  const isSearching = !!(state.searchQuery || '').trim();

  const pillsHtml = categories.map(category => {
    const isActive = !isSearching && category.id === state.selectedCategory;
    
    return `
      <button 
        type="button" 
        class="category-pill ${isActive ? 'active' : ''}" 
        data-category-id="${category.id}"
        aria-pressed="${isActive}"
        aria-label="Filter category: ${category.name}"
      >
        <span class="pill-icon">${getCategoryIcon(category.icon || category.id)}</span>
        <span class="pill-name">${escapeHtml(category.name)}</span>
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <section class="category-section" aria-label="Product Categories">
      <div class="category-section-header">
        <h2 class="category-section-title">CATEGORIES</h2>
        <span class="category-section-hint">${isSearching ? 'Search active' : (state.selectedCategory ? 'Tap active pill to close' : 'Select a category')}</span>
      </div>
      <div class="category-pills-grid">
        ${pillsHtml}
      </div>
    </section>
  `;

  // Attach click events
  const buttons = container.querySelectorAll('.category-pill');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-category-id');
      
      // If user clicks a category while searching, reset search query
      if (state.searchQuery) {
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.value = '';
        setSearchQuery('');
      }

      // Toggle or select category
      setSelectedCategory(catId);

      // If category was opened (not toggled closed), smoothly scroll toward products
      const updatedState = getState();
      if (updatedState.selectedCategory === catId) {
        setTimeout(() => {
          const productFeed = document.getElementById('product-list-mount');
          if (productFeed) {
            productFeed.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
    });
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

