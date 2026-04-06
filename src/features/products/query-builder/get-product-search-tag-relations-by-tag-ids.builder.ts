import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductSearchTagRelationsByTagIdsQueryBuilder = (
  supabaseClient: SupabaseClient<any>,
  tagIds: string[],
) => {
  return supabaseClient
    .from("product_search_tag_relations")
    .select("product_id, tag_id")
    .in("tag_id", tagIds)
}
