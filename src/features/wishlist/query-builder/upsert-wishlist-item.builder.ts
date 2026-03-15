import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const upsertWishlistItemQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  payload: { user_id: string; product_id: string }[],
) => {
  return supabaseClient
    .from("wishlists")
    .upsert(payload, { onConflict: "user_id,product_id" })
    .select("id, created_at")
    .maybeSingle()
}
