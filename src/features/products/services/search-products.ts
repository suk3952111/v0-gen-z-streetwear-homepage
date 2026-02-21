import { buildSearchProductsQuery } from '../query-builder/search-products.builder'

// TODO: execute search query and normalize error handling.
export async function searchProducts() {
  return buildSearchProductsQuery()
}