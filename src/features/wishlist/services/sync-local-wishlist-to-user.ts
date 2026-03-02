import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductsBySlugsQueryBuilder } from "@/features/wishlist/query-builder/get-products-by-slugs.builder"
import { upsertWishlistItemQueryBuilder } from "@/features/wishlist/query-builder/upsert-wishlist-item.builder"

export type LocalWishlistItem = {
  product_id: string
}

export const syncLocalWishlistToUser = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  localItems: LocalWishlistItem[],
) => {
  if (localItems.length === 0) return

  const slugs = [...new Set(localItems.map((item) => item.product_id))]
  const { data: products, error } = await getProductsBySlugsQueryBuilder(supabaseClient, slugs)

  if (error) {
    throw new Error(`로컬 Wishlist 동기화용 상품 조회 실패: ${error.message}`)
  }

  const productRows = (products ?? []) as Array<{ id: string; slug: string }>
  const idBySlug = new Map(productRows.map((p) => [p.slug, p.id]))

  const payload = localItems
    .map((item) => {
      const productDbId = idBySlug.get(item.product_id)
      if (!productDbId) return null
      return { user_id: userId, product_id: productDbId }
    })
    .filter((row): row is { user_id: string; product_id: string } => row !== null)

  if (payload.length === 0) return

  const { error: upsertError } = await upsertWishlistItemQueryBuilder(supabaseClient, payload)
  if (upsertError) {
    throw new Error(`로컬 Wishlist 동기화 실패: ${upsertError.message}`)
  }
}
