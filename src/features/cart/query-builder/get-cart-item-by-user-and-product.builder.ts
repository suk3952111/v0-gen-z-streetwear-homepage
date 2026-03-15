import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getCartItemByUserAndProductQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productId: string,
  variantId: string | null,
) => {
  const query = supabaseClient
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)

  if (variantId) {
    return query.eq("variant_id", variantId).maybeSingle()
  }

  return query.is("variant_id", null).maybeSingle()
}
