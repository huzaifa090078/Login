/**
 * Navigation & Hardware Back Button Stack Manager
 * 
 * Manages modal / screen history stack:
 * - Order Form -> View Orders -> Order Details
 * - Back button reverses each step smoothly
 * - Works identically in Mobile Browsers and Capacitor/Android WebView
 * - Leaves root screen untouched
 */

import { getState, setSelectedCategory, setSearchQuery, setActiveEditOrderId, getActiveEditOrderId } from './state.js';

const modalStack = [];
let isNavigatingHistory = false;

export function pushModalNavigation(modalId, closeCallback) {
  // Check if already top of stack
  const top = modalStack[modalStack.length - 1];
  if (top && top.modalId === modalId) return;

  modalStack.push({ modalId, closeCallback });
  
  // Push state to browser history
  window.history.pushState({ modalId, depth: modalStack.length }, '');
}

export function popModalNavigation(modalId) {
  const index = modalStack.findIndex(m => m.modalId === modalId);
  if (index !== -1) {
    modalStack.splice(index, 1);
  }
}

export function handleBackAction() {
  if (modalStack.length > 0) {
    window.history.back();
    return true;
  }
  return false;
}

/**
 * Global back step handler called directly by Android MainActivity
 * Returns true if an action was handled (modal closed, search cleared, category closed, edit cancelled)
 * Returns false if user is on root screen ready to exit
 */
export function handleAndroidBackButton() {
  // 1. Pop any open modal
  if (modalStack.length > 0) {
    const top = modalStack.pop();
    if (top && typeof top.closeCallback === 'function') {
      try {
        top.closeCallback({ fromBack: true });
      } catch (err) {
        console.error('Error closing modal on Android back button:', err);
      }
    }
    return true;
  }

  // 2. Clear active search if any
  const currentState = getState();
  if (currentState && currentState.searchQuery) {
    setSearchQuery('');
    const searchInputs = document.querySelectorAll('#global-search-input, .search-input');
    searchInputs.forEach(input => {
      if (input) input.value = '';
    });
    return true;
  }

  // 3. Close open category if any category is currently opened
  if (currentState && currentState.selectedCategory) {
    setSelectedCategory(currentState.selectedCategory); // toggles back to null
    return true;
  }

  // 4. Cancel active edit mode if active
  if (getActiveEditOrderId && getActiveEditOrderId()) {
    setActiveEditOrderId(null);
    return true;
  }

  return false;
}

// Expose on window object for native Android WebView bridge
window.handleAndroidBackButton = handleAndroidBackButton;

export function initNavigation() {
  // Listen for browser / hardware back navigation
  window.addEventListener('popstate', (e) => {
    if (modalStack.length > 0) {
      const top = modalStack.pop();
      if (top && typeof top.closeCallback === 'function') {
        try {
          top.closeCallback({ fromBack: true });
        } catch (err) {
          console.error('Error closing modal on back navigation:', err);
        }
      }
    }
  });

  // Native back button event listener
  document.addEventListener('backbutton', (e) => {
    if (handleAndroidBackButton()) {
      e.preventDefault();
    }
  }, false);

  // Future Capacitor App plugin backButton listener if loaded
  if (window.Capacitor?.Plugins?.App?.addListener) {
    try {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        handleAndroidBackButton();
      });
    } catch (e) {
      // Ignore if not in Capacitor environment
    }
  }
}

