import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductsByIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productIds: string[],
) => {
  return supabaseClient.from("products").select("id, slug").in("id", productIds)
}
