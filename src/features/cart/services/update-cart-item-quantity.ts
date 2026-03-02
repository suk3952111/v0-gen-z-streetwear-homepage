import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { updateCartItemQuantityQueryBuilder } from "@/features/cart/query-builder/update-cart-item-quantity.builder"

export const updateCartItemQuantity = async (
  supabaseClient: SupabaseClient<Database>,
  id: string,
  userId: string,
  quantity: number,
) => {
  const { error } = await updateCartItemQuantityQueryBuilder(supabaseClient, id, userId, quantity)
  if (error) {
    throw new Error(`Cart 수량 변경 실패: ${error.message}`)
  }
}
