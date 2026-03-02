import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductIdBySlugQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slug: string,
) => {
  return supabaseClient.from("products").select("id").eq("slug", slug).maybeSingle()
}
