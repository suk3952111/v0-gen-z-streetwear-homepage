import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCategoriesQueryBuilder } from "@/features/products/query-builder/get-categories.builder"
import { getProductTagsQueryBuilder } from "@/features/products/query-builder/get-product-tags.builder"
import type { ShopFilterOption } from "@/features/products/types/shop"

export const ALL_CATEGORY_VALUE = "all"

export const loadShopFilters = async (supabaseClient: SupabaseClient<Database>) => {
  const [{ data: categoriesData, error: categoriesError }, { data: tagsData, error: tagsError }] =
    await Promise.all([
      getCategoriesQueryBuilder(supabaseClient),
      getProductTagsQueryBuilder(supabaseClient),
    ])

  if (categoriesError) {
    throw new Error(`카테고리 조회 실패: ${categoriesError.message}`)
  }
  if (tagsError) {
    throw new Error(`태그 조회 실패: ${tagsError.message}`)
  }

  const categoryRows = (categoriesData ?? []) as Array<{ id: string; name: string; slug: string }>
  const tagRows = (tagsData ?? []) as Array<{ id: string; name: string; slug: string }>

  const categories: ShopFilterOption[] = [
    { value: ALL_CATEGORY_VALUE, label: "ALL" },
    ...categoryRows.map((row) => ({
      value: row.slug,
      label: row.name.toUpperCase(),
    })),
  ]

  const tags: ShopFilterOption[] = tagRows.map((row) => ({
    value: row.slug,
    label: row.name.startsWith("#") ? row.name : `#${row.name}`,
  }))

  return { categories, tags }
}
