import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getBrandBySlugQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slug: string,
) => {
  return supabaseClient
    .from("brands")
    .select("id, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
}

