import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const deleteWishlistItemByIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  id: string,
) => {
  return supabaseClient.from("wishlists").delete().eq("id", id)
}
