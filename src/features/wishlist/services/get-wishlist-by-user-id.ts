import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductsByIdsQueryBuilder } from "@/features/wishlist/query-builder/get-products-by-ids.builder"
import { getWishlistByUserIdQueryBuilder } from "@/features/wishlist/query-builder/get-wishlist-by-user-id.builder"

export type WishlistViewItem = {
  id: string
  product_id: string
  created_at: string
}

export const getWishlistByUserId = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
) => {
  const { data, error } = await getWishlistByUserIdQueryBuilder(supabaseClient, userId)
  if (error) {
    throw new Error(`Wishlist 조회 실패: ${error.message}`)
  }

  const rows = (data ?? []) as Array<{ id: string; product_id: string; created_at: string }>
  if (rows.length === 0) return [] as WishlistViewItem[]

  const productIds = rows.map((row) => row.product_id)
  const { data: products, error: productsError } = await getProductsByIdsQueryBuilder(
    supabaseClient,
    productIds,
  )

  if (productsError) {
    throw new Error(`Wishlist 상품 매핑 조회 실패: ${productsError.message}`)
  }

  const productRows = (products ?? []) as Array<{ id: string; slug: string }>
  const slugById = new Map(productRows.map((p) => [p.id, p.slug]))

  return rows
    .map((row) => {
      const slug = slugById.get(row.product_id)
      if (!slug) return null
      return {
        id: row.id,
        product_id: slug,
        created_at: row.created_at,
      }
    })
    .filter((item): item is WishlistViewItem => item !== null)
}
