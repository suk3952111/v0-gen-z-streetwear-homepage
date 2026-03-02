import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getCartItemsByUserIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
) => {
  return supabaseClient
    .from("cart_items")
    .select("id, product_id, quantity")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}
