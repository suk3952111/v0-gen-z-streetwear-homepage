import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCategoriesByIdsQueryBuilder } from "@/features/products/query-builder/get-categories-by-ids.builder"
import { getProductImagesByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-images-by-product-ids.builder"
import { getProductTagRelationsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-product-ids.builder"
import { getProductTagsByIdsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-ids.builder"
import { getProductVariantsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-variants-by-product-ids.builder"
import { getProductsBySlugsQueryBuilder } from "@/features/products/query-builder/get-products-by-slugs.builder"
import type { ShopProductItem } from "@/features/products/types/shop"

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"]
const SIZE_RANK = new Map(SIZE_ORDER.map((size, index) => [size, index]))

const toSortedSizes = (sizes: string[]) => {
  return [...new Set(sizes.map((size) => size.trim().toUpperCase()).filter(Boolean))].sort(
    (a, b) => (SIZE_RANK.get(a) ?? 999) - (SIZE_RANK.get(b) ?? 999) || a.localeCompare(b),
  )
}

export const getProductsBySlugs = async (
  supabaseClient: SupabaseClient<Database>,
  slugs: string[],
): Promise<ShopProductItem[]> => {
  if (slugs.length === 0) return []

  const { data: productRowsData, error: productRowsError } = await getProductsBySlugsQueryBuilder(
    supabaseClient,
    slugs,
  )

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
  if (productRows.length === 0) return []

  const productIds = productRows.map((row) => row.id)
  const categoryIds = [...new Set(productRows.map((row) => row.category_id))]

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

  const itemBySlug = new Map<string, ShopProductItem>()
  productRows.forEach((row) => {
    const basePrice = Number(row.base_price ?? 0)
    const categoryName = (categoryNameById.get(row.category_id) ?? "SHOP").toUpperCase()
    const isAccessory = row.slug.startsWith("acc-")
    const normalizedSizes = isAccessory ? ["ONE SIZE"] : (sizesByProductId.get(row.id) ?? [])
    itemBySlug.set(row.slug, {
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
    })
  })

  return slugs.map((slug) => itemBySlug.get(slug)).filter((item): item is ShopProductItem => !!item)
}
