import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductBySlugQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productSlug: string,
) => {
  return (supabaseClient.from("products") as any)
    .select("id")
    .eq("slug", productSlug)
    .eq("is_published", true)
    .eq("is_deleted", false)
    .maybeSingle()
}
