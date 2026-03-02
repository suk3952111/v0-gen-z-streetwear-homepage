import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductVariantByProductAndSizeQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productId: string,
  size: string,
) => {
  return (supabaseClient.from("product_variants") as any)
    .select("id, size")
    .eq("product_id", productId)
    .eq("size", size)
    .eq("is_active", true)
    .maybeSingle()
}

