import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductsBySlugsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slugs: string[],
) => {
  return supabaseClient
    .from("products")
    .select("id, slug, name, base_price, category_id, created_at")
    .in("slug", slugs)
    .eq("is_published", true)
    .eq("is_deleted", false)
}
