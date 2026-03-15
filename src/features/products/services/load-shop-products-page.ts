import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCategoriesByIdsQueryBuilder } from "@/features/products/query-builder/get-categories-by-ids.builder"
import { getCategoryBySlugQueryBuilder } from "@/features/products/query-builder/get-category-by-slug.builder"
import { getProductImagesByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-images-by-product-ids.builder"
import { getProductTagRelationsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-product-ids.builder"
import { getProductTagRelationsByTagIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-tag-ids.builder"
import { getProductTagsByIdsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-ids.builder"
import { getProductTagsBySlugsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-slugs.builder"
import { listProductsQueryBuilder } from "@/features/products/query-builder/list-products.builder"
import { ALL_CATEGORY_VALUE } from "@/features/products/services/load-shop-filters"
import type { ShopProductsPage } from "@/features/products/types/shop"

export type LoadShopProductsParams = {
  searchQuery?: string
  categorySlug?: string
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
      throw new Error(`태그 필터 조회 실패: ${tagError.message}`)
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
      throw new Error(`태그 관계 조회 실패: ${relationError.message}`)
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
      throw new Error(`카테고리 조회 실패: ${categoryError.message}`)
    }
    const categoryRow = category as { id: string; slug: string } | null
    if (!categoryRow?.id) {
      return { items: [], hasMore: false, nextOffset: 0 }
    }
    categoryId = categoryRow.id
  }

  const { data: productRowsData, error: productRowsError } = await listProductsQueryBuilder(supabaseClient, {
    offset,
    limitPlusOne: limit + 1,
    categoryId,
    searchQuery,
    productIds: filteredProductIds,
  })

  if (productRowsError) {
    throw new Error(`상품 조회 실패: ${productRowsError.message}`)
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
  ] = await Promise.all([
    getCategoriesByIdsQueryBuilder(supabaseClient, categoryIds),
    getProductImagesByProductIdsQueryBuilder(supabaseClient, productIds),
    getProductTagRelationsByProductIdsQueryBuilder(supabaseClient, productIds),
  ])

  if (categoriesError) throw new Error(`카테고리 매핑 조회 실패: ${categoriesError.message}`)
  if (imagesError) throw new Error(`상품 이미지 조회 실패: ${imagesError.message}`)
  if (tagRelationsError) throw new Error(`상품 태그 관계 조회 실패: ${tagRelationsError.message}`)

  const categories = (categoriesData ?? []) as Array<{ id: string; name: string }>
  const images = (imagesData ?? []) as Array<{
    product_id: string
    image_url: string
    is_primary: boolean
    display_order: number
  }>
  const tagRelations = (tagRelationsData ?? []) as Array<{ product_id: string; tag_id: string }>

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
      throw new Error(`태그 조회 실패: ${tagsError.message}`)
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

  const items = pageRows.map((row) => {
    const basePrice = Number(row.base_price ?? 0)
    const categoryName = (categoryNameById.get(row.category_id) ?? "SHOP").toUpperCase()
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
    }
  })

  return {
    items,
    hasMore,
    nextOffset: offset + items.length,
  }
}
