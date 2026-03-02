import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const deleteCartItemByIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  id: string,
  userId: string,
) => {
  return supabaseClient.from("cart_items").delete().eq("id", id).eq("user_id", userId)
}
