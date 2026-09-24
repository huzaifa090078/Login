/**
 * Navigation & Hardware Back Button Stack Manager
 * 
 * Manages modal / screen history stack:
 * - Order Form -> View Orders -> Order Details
 * - Back button reverses each step smoothly
 * - Works identically in Mobile Browsers and Capacitor/Android WebView
 * - Leaves root screen untouched
 */

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

  // Capacitor / Cordova native Android back button event listener
  document.addEventListener('backbutton', (e) => {
    if (modalStack.length > 0) {
      e.preventDefault();
      handleBackAction();
    }
  }, false);

  // Future Capacitor App plugin backButton listener if loaded
  if (window.Capacitor?.Plugins?.App?.addListener) {
    try {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        handleBackAction();
      });
    } catch (e) {
      // Ignore if not in Capacitor environment
    }
  }
}
