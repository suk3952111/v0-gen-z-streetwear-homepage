import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductTagsByIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  tagIds: string[],
) => {
  return supabaseClient.from("product_tags").select("id, name, slug").in("id", tagIds)
}
