import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const insertCartItemQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
) => {
  return supabaseClient
    .from("cart_items")
    .insert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId,
      quantity,
    })
    .select("id")
    .single()
}
