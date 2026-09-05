/**
 * LOGIN Mobile Accessories - Product Catalog Data Access Layer
 * 
 * ARCHITECTURE NOTE:
 * Completely decoupled from UI components.
 * Delegates to centralized catalogRepository.
 */

import * as repo from './catalogRepository.js';

export const CATEGORIES = repo.getCategories();
export const PRODUCTS = repo.getAllProducts();

export function getCategories(includeInactive = false) {
  return repo.getCategories(includeInactive);
}

export function getActiveCategories() {
  return repo.getActiveCategories();
}

export function getAllProducts(includeUnavailable = true) {
  return repo.getAllProducts(includeUnavailable);
}

export function getProductsByCategory(categoryId, includeUnavailable = true) {
  return repo.getProductsByCategory(categoryId, includeUnavailable);
}

export function getProductById(productId) {
  return repo.getProductById(productId);
}

export function searchProducts(query, categoryFilter = null) {
  return repo.searchProducts(query, categoryFilter);
}

export function registerProducts(newProducts, replaceExisting = false) {
  if (replaceExisting) {
    newProducts.forEach(p => repo.addProduct(p));
  } else {
    newProducts.forEach(p => repo.addProduct(p));
  }
}

export { repo as catalogRepository };
