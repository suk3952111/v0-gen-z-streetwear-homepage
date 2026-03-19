import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductVariantsByProductIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productIds: string[],
) => {
  return supabaseClient
    .from("product_variants")
    .select("product_id, size, is_active")
    .in("product_id", productIds)
    .eq("is_active", true)
}
