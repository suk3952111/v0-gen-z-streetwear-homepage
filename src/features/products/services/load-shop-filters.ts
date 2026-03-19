import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getBrandsQueryBuilder } from "@/features/products/query-builder/get-brands.builder"
import { getCategoriesQueryBuilder } from "@/features/products/query-builder/get-categories.builder"
import { getProductTagsQueryBuilder } from "@/features/products/query-builder/get-product-tags.builder"
import type { ShopFilterOption } from "@/features/products/types/shop"

export const ALL_CATEGORY_VALUE = "all"
export const ALL_BRAND_VALUE = "all"

export const loadShopFilters = async (supabaseClient: SupabaseClient<Database>) => {
  const [
    { data: categoriesData, error: categoriesError },
    { data: brandsData, error: brandsError },
    { data: tagsData, error: tagsError },
  ] = await Promise.all([
    getCategoriesQueryBuilder(supabaseClient),
    getBrandsQueryBuilder(supabaseClient),
    getProductTagsQueryBuilder(supabaseClient),
  ])

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
  }
  if (brandsError) {
    throw new Error(`Failed to fetch brands: ${brandsError.message}`)
  }
  if (tagsError) {
    throw new Error(`Failed to fetch tags: ${tagsError.message}`)
  }

  const categoryRows = (categoriesData ?? []) as Array<{ id: string; name: string; slug: string }>
  const brandRows = (brandsData ?? []) as Array<{ id: string; name: string; slug: string }>
  const tagRows = (tagsData ?? []) as Array<{ id: string; name: string; slug: string }>

  const categories: ShopFilterOption[] = [
    { value: ALL_CATEGORY_VALUE, label: "ALL" },
    ...categoryRows.map((row) => ({
      value: row.slug,
      label: row.name.toUpperCase(),
    })),
  ]

  const brands: ShopFilterOption[] = [
    { value: ALL_BRAND_VALUE, label: "ALL BRANDS" },
    ...brandRows.map((row) => ({
      value: row.slug,
      label: row.name.toUpperCase(),
    })),
  ]

  const tags: ShopFilterOption[] = tagRows.map((row) => ({
    value: row.slug,
    label: row.name.startsWith("#") ? row.name : `#${row.name}`,
  }))

  return { categories, brands, tags }
}
