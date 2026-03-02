import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { deleteCartItemByIdQueryBuilder } from "@/features/cart/query-builder/delete-cart-item-by-id.builder"

export const removeCartItem = async (
  supabaseClient: SupabaseClient<Database>,
  id: string,
  userId: string,
) => {
  const { error } = await deleteCartItemByIdQueryBuilder(supabaseClient, id, userId)
  if (error) {
    throw new Error(`Cart 삭제 실패: ${error.message}`)
  }
}
