import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const updateCartItemQuantityQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  id: string,
  userId: string,
  quantity: number,
) => {
  return supabaseClient
    .from("cart_items")
    .update({ quantity })
    .eq("id", id)
    .eq("user_id", userId)
}
