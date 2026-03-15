import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getCategoryBySlugQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slug: string,
) => {
  return supabaseClient.from("categories").select("id, slug").eq("slug", slug).maybeSingle()
}
