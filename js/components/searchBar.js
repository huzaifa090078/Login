/**
 * Global Product Search Bar Component
 * 
 * Searches across:
 * - Model number
 * - Product name
 * - Variant / description
 */

import { getState, setSearchQuery } from '../state.js';
import { ICONS } from '../icons.js';

export function renderSearchBar(container) {
  const state = getState();

  container.innerHTML = `
    <div class="search-section">
      <div class="search-input-wrapper">
        <span class="search-icon">${ICONS.search}</span>
        <input 
          type="text" 
          id="global-search-input" 
          class="search-input" 
          placeholder="Search by model number, product name, or variant..."
          value="${escapeHtml(state.searchQuery)}"
          autocomplete="off"
        />
        <button 
          type="button" 
          id="search-clear-btn" 
          class="search-clear-btn ${state.searchQuery ? 'visible' : ''}" 
          aria-label="Clear search"
        >${ICONS.clear}</button>
      </div>
    </div>
  `;

  const input = container.querySelector('#global-search-input');
  const clearBtn = container.querySelector('#search-clear-btn');

  let debounceTimer = null;

  input.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setSearchQuery(val);
    }, 150);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    setSearchQuery('');
    input.focus();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
