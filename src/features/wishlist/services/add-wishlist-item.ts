import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductIdBySlugQueryBuilder } from "@/features/wishlist/query-builder/get-product-id-by-slug.builder"
import { upsertWishlistItemQueryBuilder } from "@/features/wishlist/query-builder/upsert-wishlist-item.builder"

export const addWishlistItem = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productSlug: string,
) => {
  const { data: product, error: productError } = await getProductIdBySlugQueryBuilder(
    supabaseClient,
    productSlug,
  )
  if (productError) {
    throw new Error(`Wishlist 상품 조회 실패: ${productError.message}`)
  }

  const productRow = product as { id: string } | null
  if (!productRow?.id) {
    throw new Error("Wishlist 상품이 존재하지 않습니다.")
  }

  const { data, error } = await upsertWishlistItemQueryBuilder(supabaseClient, [
    { user_id: userId, product_id: productRow.id },
  ])

  if (error) {
    console.error("[wishlist] addWishlistItem:upsert failed", {
      productSlug,
      userId,
      message: error.message,
      code: error.code,
    })
    throw new Error(`Wishlist 추가 실패: ${error.message}`)
  }

  const rows = (data ?? []) as { id: string; created_at: string }[]
  const inserted = rows[0] ?? null
  return {
    id: inserted?.id ?? `local-${Date.now()}`,
    product_id: productSlug,
    created_at: inserted?.created_at ?? new Date().toISOString(),
  }
}
