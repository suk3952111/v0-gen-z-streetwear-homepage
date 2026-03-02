import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductTagsBySlugsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slugs: string[],
) => {
  return supabaseClient.from("product_tags").select("id, name, slug").in("slug", slugs)
}
