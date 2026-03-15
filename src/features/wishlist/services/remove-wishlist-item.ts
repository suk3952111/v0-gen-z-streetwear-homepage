import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { deleteWishlistItemByIdQueryBuilder } from "@/features/wishlist/query-builder/delete-wishlist-item-by-id.builder"
import { deleteWishlistItemByUserProductQueryBuilder } from "@/features/wishlist/query-builder/delete-wishlist-item-by-user-product.builder"
import { getProductIdBySlugQueryBuilder } from "@/features/wishlist/query-builder/get-product-id-by-slug.builder"

export const removeWishlistItem = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productSlug: string,
  wishlistId?: string,
) => {
  if (wishlistId) {
    const { error } = await deleteWishlistItemByIdQueryBuilder(supabaseClient, wishlistId)
    if (error) {
      throw new Error(`Wishlist 삭제 실패: ${error.message}`)
    }
    return
  }

  const { data: product, error: productError } = await getProductIdBySlugQueryBuilder(
    supabaseClient,
    productSlug,
  )
  if (productError) {
    throw new Error(`Wishlist 삭제용 상품 조회 실패: ${productError.message}`)
  }

  const productRow = product as { id: string } | null
  if (!productRow?.id) return

  const { error } = await deleteWishlistItemByUserProductQueryBuilder(
    supabaseClient,
    userId,
    productRow.id,
  )

  if (error) {
    throw new Error(`Wishlist 삭제 실패: ${error.message}`)
  }
}
