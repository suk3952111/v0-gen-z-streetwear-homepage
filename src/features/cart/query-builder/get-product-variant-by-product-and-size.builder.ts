import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductVariantByProductAndSizeQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productId: string,
  size: string,
) => {
  const normalizedSize = size.trim().toUpperCase()
  return supabaseClient
    .from("product_variants")
    .select("id, size")
    .eq("product_id", productId)
    .eq("size", normalizedSize)
    .eq("is_active", true)
    .maybeSingle()
}
