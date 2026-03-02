import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getWishlistByUserIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
) => {
  return supabaseClient
    .from("wishlists")
    .select("id, product_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}
