import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

type ListProductsBuilderParams = {
  offset: number
  limitPlusOne: number
  categoryId?: string | null
  searchQuery?: string
  productIds?: string[] | null
}

export const listProductsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  params: ListProductsBuilderParams,
) => {
  const { offset, limitPlusOne, categoryId, searchQuery, productIds } = params

  let query: any = supabaseClient
    .from("products")
    .select("id, slug, name, base_price, category_id, created_at")
    .eq("is_published", true)
    .eq("is_deleted", false)

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().replace(/,/g, " ")
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
  }

  if (productIds) {
    if (productIds.length === 0) {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"])
    } else {
      query = query.in("id", productIds)
    }
  }

  return query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limitPlusOne - 1)
}
