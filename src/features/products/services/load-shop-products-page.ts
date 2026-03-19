import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCategoriesByIdsQueryBuilder } from "@/features/products/query-builder/get-categories-by-ids.builder"
import { getBrandBySlugQueryBuilder } from "@/features/products/query-builder/get-brand-by-slug.builder"
import { getCategoryBySlugQueryBuilder } from "@/features/products/query-builder/get-category-by-slug.builder"
import { getProductImagesByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-images-by-product-ids.builder"
import { getProductTagRelationsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-product-ids.builder"
import { getProductTagRelationsByTagIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-tag-ids.builder"
import { getProductTagsByIdsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-ids.builder"
import { getProductTagsBySlugsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-slugs.builder"
import { getProductVariantsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-variants-by-product-ids.builder"
import { listProductsQueryBuilder } from "@/features/products/query-builder/list-products.builder"
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
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"]
const SIZE_RANK = new Map(SIZE_ORDER.map((size, index) => [size, index]))

const toSortedSizes = (sizes: string[]) => {
  return [...new Set(sizes.map((size) => size.trim().toUpperCase()).filter(Boolean))].sort(
    (a, b) => (SIZE_RANK.get(a) ?? 999) - (SIZE_RANK.get(b) ?? 999) || a.localeCompare(b),
  )
}

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

  const productRows = (productRowsData ?? []) as Array<{
    id: string
    slug: string
    name: string
    base_price: number
    category_id: string
  }>

  const hasMore = productRows.length > limit
  const pageRows = hasMore ? productRows.slice(0, limit) : productRows
  if (pageRows.length === 0) {
    return { items: [], hasMore: false, nextOffset: 0 }
  }

  const productIds = pageRows.map((row) => row.id)
  const categoryIds = [...new Set(pageRows.map((row) => row.category_id))]

  const [
    { data: categoriesData, error: categoriesError },
    { data: imagesData, error: imagesError },
    { data: tagRelationsData, error: tagRelationsError },
    { data: variantsData, error: variantsError },
  ] = await Promise.all([
    getCategoriesByIdsQueryBuilder(supabaseClient, categoryIds),
    getProductImagesByProductIdsQueryBuilder(supabaseClient, productIds),
    getProductTagRelationsByProductIdsQueryBuilder(supabaseClient, productIds),
    getProductVariantsByProductIdsQueryBuilder(supabaseClient, productIds),
  ])

  if (categoriesError) throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
  if (imagesError) throw new Error(`Failed to fetch images: ${imagesError.message}`)
  if (tagRelationsError) throw new Error(`Failed to fetch product tags: ${tagRelationsError.message}`)
  if (variantsError) throw new Error(`Failed to fetch product sizes: ${variantsError.message}`)

  const categories = (categoriesData ?? []) as Array<{ id: string; name: string }>
  const images = (imagesData ?? []) as Array<{
    product_id: string
    image_url: string
    is_primary: boolean
    display_order: number
  }>
  const tagRelations = (tagRelationsData ?? []) as Array<{ product_id: string; tag_id: string }>
  const variants = (variantsData ?? []) as Array<{ product_id: string; size: string; is_active: boolean }>

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const primaryImageByProductId = new Map<string, string>()
  images.forEach((image) => {
    if (!primaryImageByProductId.has(image.product_id)) {
      primaryImageByProductId.set(image.product_id, image.image_url)
    }
  })

  const tagIds = [...new Set(tagRelations.map((relation) => relation.tag_id))]
  let tagNameById = new Map<string, string>()
  if (tagIds.length > 0) {
    const { data: tagsData, error: tagsError } = await getProductTagsByIdsQueryBuilder(
      supabaseClient,
      tagIds,
    )
    if (tagsError) {
      throw new Error(`Failed to fetch tags: ${tagsError.message}`)
    }
    const tags = (tagsData ?? []) as Array<{ id: string; name: string }>
    tagNameById = new Map(tags.map((tag) => [tag.id, tag.name]))
  }

  const tagNamesByProductId = new Map<string, string[]>()
  tagRelations.forEach((relation) => {
    const name = tagNameById.get(relation.tag_id)
    if (!name) return
    const label = name.startsWith("#") ? name : `#${name}`
    const list = tagNamesByProductId.get(relation.product_id) ?? []
    list.push(label)
    tagNamesByProductId.set(relation.product_id, list)
  })

  const rawSizesByProductId = new Map<string, string[]>()
  variants.forEach((variant) => {
    const normalized = (variant.size ?? "").trim().toUpperCase()
    if (!normalized) return
    const list = rawSizesByProductId.get(variant.product_id) ?? []
    list.push(normalized)
    rawSizesByProductId.set(variant.product_id, list)
  })

  const sizesByProductId = new Map<string, string[]>()
  rawSizesByProductId.forEach((sizes, productId) => {
    sizesByProductId.set(productId, toSortedSizes(sizes))
  })

  const items = pageRows.map((row) => {
    const basePrice = Number(row.base_price ?? 0)
    const categoryName = (categoryNameById.get(row.category_id) ?? "SHOP").toUpperCase()
    const isAccessory = row.slug.startsWith("acc-")
    const normalizedSizes = isAccessory ? ["ONE SIZE"] : (sizesByProductId.get(row.id) ?? [])
    return {
      id: row.slug,
      name: row.name,
      priceKRW: basePrice,
      priceUSD: Math.max(1, Math.round(basePrice / 1000)),
      aiMatch: 0,
      image: primaryImageByProductId.get(row.id) ?? "/placeholder.svg",
      category: {
        EN: categoryName,
        KR: categoryName,
      },
      tags: tagNamesByProductId.get(row.id) ?? [],
      sizes: normalizedSizes,
    }
  })

  return {
    items,
    hasMore,
    nextOffset: offset + items.length,
  }
}
