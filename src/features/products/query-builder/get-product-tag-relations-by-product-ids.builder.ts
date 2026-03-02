import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductTagRelationsByProductIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productIds: string[],
) => {
  return supabaseClient.from("product_tag_relations").select("product_id, tag_id").in("product_id", productIds)
}
