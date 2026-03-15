import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductBySlugQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slug: string,
) => {
  return (supabaseClient.from("products") as any)
    .select("id, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_deleted", false)
    .maybeSingle()
}

