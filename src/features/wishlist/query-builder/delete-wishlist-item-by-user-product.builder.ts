import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const deleteWishlistItemByUserProductQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productId: string,
) => {
  return supabaseClient.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId)
}
