import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductSearchTagsBySlugsQueryBuilder = (
  supabaseClient: SupabaseClient<any>,
  slugs: string[],
) => {
  return supabaseClient
    .from("product_search_tags")
    .select("id, name, slug")
    .in("slug", slugs)
}
