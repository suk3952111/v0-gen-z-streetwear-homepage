import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductTagRelationsByTagIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  tagIds: string[],
) => {
  return supabaseClient.from("product_tag_relations").select("product_id, tag_id").in("tag_id", tagIds)
}
