import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getBrandBySlugQueryBuilder } from "@/features/products/query-builder/get-brand-by-slug.builder"
import { getCategoryBySlugQueryBuilder } from "@/features/products/query-builder/get-category-by-slug.builder"
import { getProductTagRelationsByTagIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-tag-ids.builder"
import { getProductTagsBySlugsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-slugs.builder"
import { listProductsQueryBuilder } from "@/features/products/query-builder/list-products.builder"
import { buildShopProductItems, type ShopProductRow } from "@/features/products/services/build-shop-product-items"
import { ALL_BRAND_VALUE, ALL_CATEGORY_VALUE } from "@/features/products/services/load-shop-filters"
import type { ShopProductsPage } from "@/features/products/types/shop"

export type LoadShopProductsParams = {
  searchQuery?: string
  categorySlug?: string
  brandSlug?: string
  tagSlugs?: string[]
  offset?: number
  limit?: number
}

const DEFAULT_LIMIT = 16

export const loadShopProductsPage = async (
  supabaseClient: SupabaseClient<Database>,
  params: LoadShopProductsParams,
): Promise<ShopProductsPage> => {
  const searchQuery = params.searchQuery?.trim() ?? ""
  const categorySlug = params.categorySlug ?? ALL_CATEGORY_VALUE
  const brandSlug = params.brandSlug ?? ALL_BRAND_VALUE
  const tagSlugs = params.tagSlugs ?? []
  const offset = Math.max(0, params.offset ?? 0)
  const limit = Math.max(1, Math.min(40, params.limit ?? DEFAULT_LIMIT))

  let filteredProductIds: string[] | null = null
  if (tagSlugs.length > 0) {
    const { data: tagRows, error: tagError } = await getProductTagsBySlugsQueryBuilder(
      supabaseClient,
      tagSlugs,
    )
    if (tagError) {
      throw new Error(`Failed to fetch tags: ${tagError.message}`)
    }

    const tags = (tagRows ?? []) as Array<{ id: string; slug: string }>
    if (tags.length === 0) {
      return { items: [], hasMore: false, nextOffset: 0 }
    }

    const tagIds = tags.map((tag) => tag.id)
    const { data: relations, error: relationError } = await getProductTagRelationsByTagIdsQueryBuilder(
      supabaseClient,
      tagIds,
    )
    if (relationError) {
      throw new Error(`Failed to fetch tag relations: ${relationError.message}`)
    }

    const relationRows = (relations ?? []) as Array<{ product_id: string; tag_id: string }>
    filteredProductIds = [...new Set(relationRows.map((row) => row.product_id))]
    if (filteredProductIds.length === 0) {
      return { items: [], hasMore: false, nextOffset: 0 }
    }
  }

  let categoryId: string | null = null
  if (categorySlug !== ALL_CATEGORY_VALUE) {
    const { data: category, error: categoryError } = await getCategoryBySlugQueryBuilder(
      supabaseClient,
      categorySlug,
    )
    if (categoryError) {
      throw new Error(`Failed to fetch category: ${categoryError.message}`)
    }
    const categoryRow = category as { id: string; slug: string } | null
    if (!categoryRow?.id) {
      return { items: [], hasMore: false, nextOffset: 0 }
    }
    categoryId = categoryRow.id
  }

  let brandId: string | null = null
  if (brandSlug !== ALL_BRAND_VALUE) {
    const { data: brand, error: brandError } = await getBrandBySlugQueryBuilder(
      supabaseClient,
      brandSlug,
    )
    if (brandError) {
      throw new Error(`Failed to fetch brand: ${brandError.message}`)
    }
    const brandRow = brand as { id: string; slug: string } | null
    if (!brandRow?.id) {
      return { items: [], hasMore: false, nextOffset: 0 }
    }
    brandId = brandRow.id
  }

  const { data: productRowsData, error: productRowsError } = await listProductsQueryBuilder(supabaseClient, {
    offset,
    limitPlusOne: limit + 1,
    categoryId,
    brandId,
    searchQuery,
    productIds: filteredProductIds,
  })

  if (productRowsError) {
    throw new Error(`Failed to fetch products: ${productRowsError.message}`)
  }

  const productRows = (productRowsData ?? []) as ShopProductRow[]
  const hasMore = productRows.length > limit
  const pageRows = hasMore ? productRows.slice(0, limit) : productRows

  if (pageRows.length === 0) {
    return { items: [], hasMore: false, nextOffset: 0 }
  }

  const items = await buildShopProductItems(supabaseClient, pageRows)

  return {
    items,
    hasMore,
    nextOffset: offset + items.length,
  }
}
